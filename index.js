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
    const { customer, items, totalAmount, orderId } = req.body;

    // Формуємо список товарів для листа
    const itemsListHtml = items
      .map(
        (item) => `
      <li><b>${item.name}</b> — ${item.quantity || 1} шт. (€${item.price})</li>
    `,
      )
      .join("");

    // Текст листа, який прийде ТОБІ на пошту
    await resend.emails.send({
      from: "onboarding@resend.dev", // На старті використовуємо стандартну пошту Resend
      to: "galicianelitism@gmail.com", // Твоя особиста пошта
      subject: `New Order №${orderId || Date.now()}`,
      html: `
        <h2>Деталі замовлення:</h2>
        <p><b>name:</b> ${customer.name}</p>
        <p><b>Email:</b> ${customer.email}</p>
        <p><b>Phone number:</b> ${customer.phone || "Не вказано"}</p>
        <p><b>Address:</b> ${customer.address || "Не вказано"}</p>
        <hr>
        <h3>Items:</h3>
        <ul>${itemsListHtml}</ul>
        <p><b>Total Price:</b> €${totalAmount}</p>
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
