import express from "express";
import passport from "passport";
import googleController from "../controllers/google.controller.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleController.googleCallback,
);

export default router;
