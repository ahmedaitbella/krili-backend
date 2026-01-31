// Note: On Vercel, environment variables are injected directly via process.env
// No need for dotenv in production

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  sessionSecret: process.env.SESSION_SECRET || 'your_session_secret',
  // SMTP Configuration
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFromEmail: process.env.SMTP_FROM_EMAIL,
  // OTP Configuration
  otpExpiry: process.env.OTP_EXPIRY || 10 // minutes
};
