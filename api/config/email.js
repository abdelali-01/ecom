const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD // your email password or app password
  }
});

// Email templates
const emailTemplates = {
  passwordReset: (resetToken, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #666; line-height: 1.6;">
          You requested a password reset for your account. Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #465FFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #465FFF; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #666; line-height: 1.6;">
          This link will expire in 1 hour for security reasons.
        </p>
        <p style="color: #666; line-height: 1.6;">
          If you didn't request this password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email, please do not reply.
        </p>
      </div>
    `
  }),
  
  passwordResetSuccess: (email) => ({
    subject: 'Password Reset Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Successful</h2>
        <p style="color: #666; line-height: 1.6;">
          Your password has been successfully reset for the account: <strong>${email}</strong>
        </p>
        <p style="color: #666; line-height: 1.6;">
          You can now log in with your new password.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email, please do not reply.
        </p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailContent = emailTemplates[template](...Object.values(data));
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
}; 