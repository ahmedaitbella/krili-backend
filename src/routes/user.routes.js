import express from "express";
import userController from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/search", userController.searchUsers);

// Protected routes
router.use(verifyToken);

// Current user profile
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);

// Admin routes (all users)
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
