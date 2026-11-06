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
    const { customer, items, totalAmount, shippingPrice, orderId, time, paymentMethod, payment_method } =
      req.body;

    const finalPaymentMethod = paymentMethod || payment_method || "PayPal";

    const itemsListHtml = items
      .map(
        (item) =>
          `<li><b>${item.name}</b> — ${item.quantity || 1} шт. (${item.price})</li>`,
      )
      .join("");

    // 1. ВІДПРАВКА ЛИСТА ТОБІ (Адміну)
    await resend.emails.send({
      from: 'onboarding@resend.dev',  
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
        <p><b>Payment Method:</b> ${finalPaymentMethod}</p>
        <hr>
        <h3>Items:</h3>
        <ul>${itemsListHtml}</ul>
        <p><b>Sipping:</b> ${shippingPrice}</p>
        <p><b>Total price to be paid:</b> <b>${totalAmount}</b></p>
      `,
    });

    // 2. ВІДПРАВКА ПІДТВЕРДЖЕННЯ КЛІЄНТУ
    if (customer && customer.email && customer.email.includes("@") && customer.email !== "P2P Transfer") {
      const instructions = finalPaymentMethod.includes('PayPal')
        ? `<p><b>Next Step (PayPal):</b> Please complete your payment of <b>${totalAmount}</b> manually via our PayPal link.</p>`
        : `<p><b>Next Step (Bank Transfer / IBAN):</b> Your order has been placed with IBAN payment. We will send the bank transfer details to your email shortly.</p>`;

      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: customer.email,
          subject: `Order Confirmed - ${orderId} [Galician Elitism]`,
          html: `
            <h2>ORDER CONFIRMED</h2>
            <p>Thank you for your order! Your order <b>${orderId}</b> has been successfully generated.</p>
            <hr>
            <h3>Your Order Details:</h3>
            <ul>${itemsListHtml}</ul>
            <p><b>Shipping:</b> ${shippingPrice}</p>
            <p><b>Total Amount:</b> ${totalAmount}</p>
            <p><b>Payment Method:</b> ${finalPaymentMethod}</p>
            <hr>
            ${instructions}
            <p><i>Hails, Galician Elitism</i></p>
          `,
        });
      } catch (clientEmailError) {
        console.error("Не вдалося надіслати лист клієнту:", clientEmailError.message);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
