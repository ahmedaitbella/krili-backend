import express from "express";
import favoriteController from "../controllers/favorite.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All favorite routes require authentication
router.use(verifyToken);

router.get("/:userId", favoriteController.getUserFavorites);
router.post("/add", favoriteController.addToFavorites);
router.post("/remove", favoriteController.removeFromFavorites);
router.post("/toggle", favoriteController.toggleFavorite);
router.delete("/:userId/clear", favoriteController.clearFavorites);

export default router;
