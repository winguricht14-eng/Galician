require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/order-notification", async (req, res) => {
  try {
    const { customer, items, totalAmount, shippingPrice, orderId, time } =
      req.body;

    const itemsListHtml = items
      .map(
        (item) =>
          `<li><b>${item.name}</b> — ${item.quantity || 1} шт. (${item.price})</li>`,
      )
      .join("");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "galicianelitism@gmail.com",
      subject: `New order №${orderId}`,
      html: `
        <h2>Order information №${orderId}</h2>
        <p><b>Time:</b> ${time}</p>
        <hr>
        <p><b>Customer:</b> ${customer.name}</p>
        <p><b>Email:</b> ${customer.email}</p>
        <p><b>Phone number:</b> ${customer.phone}</p>
        <p><b>Full address:</b> ${customer.address}</p>
        <hr>
        <h3>Items:</h3>
        <ul>${itemsListHtml}</ul>
        <p><b>Sipping:</b> ${shippingPrice}</p>
        <p><b>Total price to be paid:</b> <b>${totalAmount}</b></p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
