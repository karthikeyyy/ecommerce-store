import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use host/port from env
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${user.name},</p>
        <p>We have received your order.</p>
        <h2>Order Details:</h2>
        <ul>
          ${order.items
            .map(
              (item) => {
                const attributes = item.selectedAttributes && item.selectedAttributes.length > 0
                  ? `<br/><small>${item.selectedAttributes.map(a => `${a.name}: ${a.value}`).join(', ')}</small>`
                  : '';
                  
                return `
            <li>
              ${item.product ? item.product.name : "Product"} ${attributes} - Qty: ${item.quantity} - Total: ₹${item.quantity * item.price}
            </li>
          `;
              }
            )
            .join("")}
        </ul>
        <h3>Total Amount: ₹${order.totalAmount}</h3>
        <p>We will notify you once your order is shipped.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
