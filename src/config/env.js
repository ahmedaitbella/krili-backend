// Load dotenv only in local development (not on Vercel)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const dotenv = await import("dotenv");
  dotenv.config();
}

export const port = process.env.PORT || 3000;
export const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";
export const jwtSecret = process.env.JWT_SECRET || "change_me";
export const googleClientId = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
export const sessionSecret =
  process.env.SESSION_SECRET || "your_session_secret";
// SMTP Configuration
export const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
export const smtpPort = process.env.SMTP_PORT || 587;
export const smtpUser = process.env.SMTP_USER;
export const smtpPassword = process.env.SMTP_PASSWORD;
export const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
// OTP Configuration
export const otpExpiry = process.env.OTP_EXPIRY || 10; // minutes
// Frontend URL used for password reset links
export const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
