import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {

  try {

    const response = await resend.emails.send({

      from: 'EmoTradeLog <onboarding@resend.dev>',

      to: options.email,

      subject: options.subject,

      html: `
        <div style="
          font-family: Arial;
          padding: 20px;
          background: #111827;
          color: white;
          border-radius: 10px;
        ">

          <h2 style="color:#facc15;">
            EmoTradeLog Verification
          </h2>

          <p>Your OTP code is:</p>

          <div style="
            font-size: 40px;
            font-weight: bold;
            margin: 20px 0;
            color:#facc15;
            letter-spacing: 5px;
          ">
            ${options.message.match(/\d+/)?.[0] || ''}
          </div>

          <p>This OTP expires in 5 minutes.</p>

        </div>
      `,
    });

    console.log(response);

  } catch (error) {

    console.error('Resend Email Error:', error);

    throw error;
  }
};

export default sendEmail;