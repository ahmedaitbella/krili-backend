import express from "express";
import authController from "../controllers/auth.controller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";

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

export default router;
