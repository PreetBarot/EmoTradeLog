import nodemailer from 'nodemailer';

const getTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER || 'preetbarotpreet@gmail.com';
  const pass = process.env.EMAIL_PASS || 'jtoz ewgi akaa hhxu';
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true' || port === 465;

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
};

const sendEmail = async (options) => {
  const user = process.env.EMAIL_USER || 'preetbarotpreet@gmail.com';
  const pass = process.env.EMAIL_PASS || 'jtoz ewgi akaa hhxu';
  const fromEmail = process.env.EMAIL_FROM || (user ? `"EmoTradeLog" <${user}>` : '"EmoTradeLog" <no-reply@emotradelog.com>');

  const { email, subject, message, otp, type = 'otp', user: userData } = options;

  // Extract OTP if passed in message or otp prop
  const otpCode = otp || (message ? message.match(/\d{4,8}/)?.[0] : '');

  // Check if credentials are configured
  const hasCredentials = Boolean(
    user &&
    pass &&
    !user.includes('your_') &&
    !pass.includes('your_')
  );

  if (!hasCredentials) {
    console.log('\n============================================================');
    console.log('⚠️  [EMAIL SERVICE - DEV FALLBACK]');
    console.log('EMAIL_USER and EMAIL_PASS are not configured.');
    console.log(`Intended Recipient : ${email}`);
    console.log(`Subject            : ${subject}`);
    if (otpCode) {
      console.log(`🔑 Verification OTP: ${otpCode}`);
    }
    console.log('============================================================\n');
    return { success: true, simulated: true, otp: otpCode };
  }

  let htmlContent = '';
  let textContent = message || '';

  if (type === 'otp' || type === 'reset_otp') {
    const isReset = type === 'reset_otp';
    const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
    const subtext = isReset
      ? 'You requested a password reset for your EmoTradeLog account. Use the verification code below to proceed.'
      : 'Thank you for signing up for EmoTradeLog! Use the verification code below to verify your email address and activate your account.';

    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .logo { display: inline-block; width: 44px; height: 44px; line-height: 44px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #facc15, #ca8a04); color: #000000; font-weight: bold; font-size: 24px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
          .text { font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 0 0 24px 0; }
          .otp-box { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #facc15; font-family: 'Courier New', Courier, monospace; margin: 0; }
          .expiry { font-size: 13px; color: #6b7280; margin-top: 10px; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">E</div>
          <h1 class="title">${heading}</h1>
          <p class="text">${subtext}</p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="expiry">Expires in 5 minutes</div>
          </div>
          <p class="text" style="font-size: 13px;">If you didn't request this code, you can safely ignore this email.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} EmoTradeLog. All rights reserved.<br>
            AI-Powered Trading Journal & Analytics Platform
          </div>
        </div>
      </body>
      </html>
    `;
    textContent = `Your EmoTradeLog verification code is: ${otpCode}\nThis code will expire in 5 minutes.`;
  } else if (type === 'welcome') {
    const name = userData?.firstName ? `${userData.firstName}` : 'Trader';
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .logo { display: inline-block; width: 44px; height: 44px; line-height: 44px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #facc15, #ca8a04); color: #000000; font-weight: bold; font-size: 24px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
          .text { font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 0 0 20px 0; }
          .credential-box { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .credential-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .credential-label { color: #9ca3af; }
          .credential-val { color: #facc15; font-weight: 600; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">E</div>
          <h1 class="title">Welcome to EmoTradeLog! 🚀</h1>
          <p class="text">Hello ${name}, your trading journal account has been successfully created and verified.</p>
          <div class="credential-box">
            <div style="font-weight: 600; color: #ffffff; margin-bottom: 12px; font-size: 15px;">Your Account Credentials:</div>
            <div class="credential-item">
              <span class="credential-label">Login Email:</span>
              <span class="credential-val">${email}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Status:</span>
              <span class="credential-val" style="color: #4ade80;">Active &amp; Verified</span>
            </div>
          </div>
          <p class="text">You can now access your dashboard, log trades, connect your MT5 account, and analyze your trading psychology with AI.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} EmoTradeLog. All rights reserved.<br>
            AI-Powered Trading Journal & Analytics Platform
          </div>
        </div>
      </body>
      </html>
    `;
    textContent = `Welcome to EmoTradeLog, ${name}!\n\nYour account has been created successfully.\nLogin Email: ${email}\nStatus: Active\n\nLog in at your EmoTradeLog terminal.`;
  } else {
    htmlContent = options.html || `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #111827; color: white; border-radius: 10px;">
        <h2 style="color: #facc15;">${subject}</h2>
        <p>${message || ''}</p>
      </div>
    `;
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [NODEMAILER] Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [NODEMAILER ERROR]:', error.message || error);
    throw error;
  }
};

export default sendEmail;
