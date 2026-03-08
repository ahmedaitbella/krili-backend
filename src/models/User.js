import { Schema, model } from "mongoose";

const UserAddressSchema = new Schema(
  {
    city: String,
    neighborhood: String,
    coords: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false },
);

const UserSchema = new Schema({
  // Informations de profil
  name: { type: String },
  firstName: { type: String },
  lastName: String,
  email: { type: String, required: true, unique: true, index: true },
  phone: String,
  imageUrl: String,
  address: UserAddressSchema,
  role: {
    type: String,
    enum: ["tenant", "owner", "both"],
    default: "tenant",
  },
  rating: { type: Number, default: 0 },

  // Authentification classique
  password: { type: String },

  // Authentification Google
  googleId: { type: String, unique: true, sparse: true },

  // OTP (One-Time Password)
  otp: { type: String },
  otpExpiry: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },

  // Refresh token (stored as SHA-256 hash for security)
  refreshTokenHash: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

export default model("User", UserSchema);
