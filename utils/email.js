const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1.) create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2.) definee email options
  const mailOptions = {
    from: 'Ayan Paul <hello@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3.) send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
