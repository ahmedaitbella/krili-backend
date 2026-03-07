import nodemailer from "nodemailer";
import {
  smtpHost,
  smtpPort,
  smtpUser,
  smtpPassword,
  smtpFromEmail,
} from "../config/env.js";

const portNumber = Number(smtpPort) || 587;
const secure = portNumber === 465;

// Allow disabling strict TLS verification in non-production for self-signed certs
const tlsOptions = {};
if (
  process.env.SMTP_REJECT_UNAUTHORIZED === "false" ||
  process.env.NODE_ENV !== "production"
) {
  tlsOptions.rejectUnauthorized = false;
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: portNumber,
  secure,
  auth:
    smtpUser && smtpPassword
      ? { user: smtpUser, pass: smtpPassword }
      : undefined,
  tls: tlsOptions,
});

const sendOTPEmail = async (email, otp, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: "Your OTP Verification Code",
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

const sendWelcomeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: "Welcome to Our Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${fullName}!</h2>
          <p>Thank you for registering on our platform.</p>
          <p>Your account has been successfully created.</p>
          <p><a href="https://yourapp.com/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a></p>
          <hr />
          <p style="color: #666; font-size: 12px;">© 2026 Your Company. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

const sendPasswordResetEmail = async (email, resetLink, fullName) => {
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: "Reset Your Password",
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
      `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      // If sending fails in development, fallback to Ethereal so devs can inspect the email
      console.error("Error sending password reset email:", err);
      if (process.env.NODE_ENV !== "production") {
        try {
          const testAccount = await nodemailer.createTestAccount();
          const testTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
          });
          const info = await testTransporter.sendMail(mailOptions);
          const preview = nodemailer.getTestMessageUrl(info);
          console.info("Ethereal preview URL:", preview);
          return { success: true, messageId: info.messageId, preview };
        } catch (ethErr) {
          console.error("Ethereal fallback failed:", ethErr);
        }
      }
      throw new Error("Failed to send password reset email");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail };
