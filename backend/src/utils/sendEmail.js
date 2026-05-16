import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Use simple setup or ethereal email if not configured
  let transporter;
  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback to ethereal for testing or simple dummy logging
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'dummy@ethereal.email',
        pass: 'dummy',
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'EmoTradeLog'} <${process.env.FROM_EMAIL || 'noreply@emotradelog.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
    if (!process.env.EMAIL_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending error:', error);
    // Continue even if email fails, so we can test with hardcoded OTP for development
  }
};

export default sendEmail;
