import nodemailer from 'nodemailer';

export async function sendResetEmail(toEmail, resetLink) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  let info = await transporter.sendMail({
    from: '"MyApp Support" <no-reply@myapp.com>',
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });

  console.log("Preview Email URL: %s", nodemailer.getTestMessageUrl(info));
}


