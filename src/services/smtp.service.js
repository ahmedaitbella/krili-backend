const nodemailer = require('nodemailer');
const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFromEmail } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword
  }
});

const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${fullName},</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">© 2026 Your Company. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

const sendWelcomeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: 'Welcome to Our Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${fullName}!</h2>
          <p>Thank you for registering on our platform.</p>
          <p>Your account has been successfully created.</p>
          <p><a href="https://yourapp.com/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a></p>
          <hr />
          <p style="color: #666; font-size: 12px;">© 2026 Your Company. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

const sendPasswordResetEmail = async (email, resetLink, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${fullName},</p>
          <p>You requested to reset your password. Click the link below:</p>
          <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">© 2026 Your Company. All rights reserved.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
