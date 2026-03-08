import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import {
  jwtSecret,
  googleClientId,
  googleClientSecret,
  googleCallbackUrl,
} from "./env.js";

// Debug: log environment variables
console.log("🔍 Environment check:");
console.log("- GOOGLE_CLIENT_ID:", googleClientId ? "✅ Loaded" : "❌ Missing");
console.log(
  "- GOOGLE_CLIENT_SECRET:",
  googleClientSecret ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "- GOOGLE_CALLBACK_URL:",
  googleCallbackUrl ? "✅ Loaded" : "❌ Missing",
);

if (!googleClientId || !googleClientSecret || !googleCallbackUrl) {
  console.error(
    "❌ Missing Google OAuth credentials - skipping Passport configuration",
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          let isNewUser = false;
          if (!user) {
            // Also try to find by email in case the user registered normally first
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link the Google account to the existing user
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                role: "tenant",
                isEmailVerified: true,
              });
              isNewUser = true;
            }
          }
          const token = signToken({ id: user._id });
          return done(null, { user, token, isNewUser });
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );

  passport.serializeUser((obj, done) => done(null, obj));
  passport.deserializeUser((obj, done) => done(null, obj));
}

export default passport;
