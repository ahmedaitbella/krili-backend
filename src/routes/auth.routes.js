import express from "express";
import authController from "../controllers/auth.controller.js";
import {
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logoutUser,
} from "../controllers/auth.controller.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", (req, res) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  forgotPassword(req, res);
});

router.post("/reset-password", (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  resetPassword(req, res);
});

// Protected: change password (must be logged in)
router.post("/change-password", verifyToken, (req, res) => {
  if (!req.body.currentPassword || !req.body.newPassword) {
    return res
      .status(400)
      .json({ message: "currentPassword and newPassword are required" });
  }
  changePassword(req, res);
});

// Token refresh (public — caller supplies the refresh token in the body)
router.post("/refresh", refreshToken);

// Logout — invalidates the stored refresh token hash
router.post("/logout", verifyToken, logoutUser);

export default router;
