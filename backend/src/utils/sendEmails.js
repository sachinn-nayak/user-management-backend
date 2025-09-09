import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,   
    pass: process.env.GMAIL_PASS,      
  },
});

export async function sendResetEmail(toEmail, resetLink) {
  let info = await transporter.sendMail({
    from: '"MyApp Support" <yourgmail@gmail.com>',
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
    `,
  });

  console.log("Message sent:", info.messageId);
}


