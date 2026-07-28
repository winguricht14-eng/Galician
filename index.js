require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

// Дозволяємо запити з твого GitHub Pages
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/order-notification", async (req, res) => {
  try {
    const { customer, items, totalAmount, shippingPrice, orderId, time } =
      req.body;

    // Списки товарів для HTML-листа
    const itemsListHtml = items
      .map(
        (item) =>
          `<li><b>${item.name}</b> — ${item.quantity || 1} шт. (${item.price})</li>`,
      )
      .join("");

    // Відправляємо лист вам (адміну)
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "galicianelitism@gmail.com",
      subject: `🔔 Нове замовлення №${orderId}`,
      html: `
        <h2>Деталі замовлення №${orderId}</h2>
        <p><b>Час замовлення:</b> ${time}</p>
        <hr>
        <p><b>Клієнт:</b> ${customer.name}</p>
        <p><b>Email:</b> ${customer.email}</p>
        <p><b>Телефон:</b> ${customer.phone}</p>
        <p><b>Адреса:</b> ${customer.address}</p>
        <hr>
        <h3>Товари:</h3>
        <ul>${itemsListHtml}</ul>
        <p><b>Доставка:</b> ${shippingPrice}</p>
        <p><b>Загальна сума до сплати:</b> <b>${totalAmount}</b></p>
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
