import nodemailer from "nodemailer";
import {
  smtpHost,
  smtpPort,
  smtpUser,
  smtpPassword,
  smtpFromEmail,
  smtpConfigured,
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
  if (!smtpConfigured) {
    throw new Error(
      "Email service is not configured on this server. Please contact support.",
    );
  }
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
    throw new Error("Failed to send OTP email: " + (error.message || ""));
  }
};

const sendWelcomeEmail = async (email, fullName) => {
  if (!smtpConfigured) {
    console.warn("[SMTP] Not configured — skipping welcome email to", email);
    return { success: false, skipped: true };
  }
  try {
    const mailOptions = {
      from: smtpFromEmail,
      to: email,
      subject: "Bienvenue sur Krili ! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 32px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #e85d04; margin: 0;">Krili</h1>
            <p style="color: #888; font-size: 13px; margin-top: 4px;">La plateforme de location d'équipements entre particuliers au Maroc</p>
          </div>
          <h2 style="color: #222;">Bienvenue, ${fullName} !</h2>
          <p style="color: #444; line-height: 1.6;">Votre compte a été créé avec succès. Vous pouvez désormais :</p>
          <ul style="color: #444; line-height: 2;">
            <li>🔍 Parcourir des milliers d'équipements disponibles</li>
            <li>📦 Louer du matériel près de chez vous</li>
            <li>💰 Proposer vos propres équipements à la location</li>
          </ul>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.FRONTEND_URL || "https://krili.vercel.app"}" style="background-color: #e85d04; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Commencer à explorer</a>
          </div>
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
          <p style="color: #aaa; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} Krili. Tous droits réservés.</p>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Welcome email is non-critical — log but don't throw
    console.error(
      "[SMTP] Failed to send welcome email to",
      email,
      error.message,
    );
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetLink, fullName) => {
  if (!smtpConfigured) {
    throw new Error(
      "Email service is not configured on this server. Password reset emails cannot be sent.",
    );
  }
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
