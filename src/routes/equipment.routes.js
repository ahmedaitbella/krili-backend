import express from "express";
import equipmentController from "../controllers/equipment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", equipmentController.getAllEquipments);
router.get("/search", equipmentController.searchEquipments);
router.get("/nearby", equipmentController.getEquipmentsByLocation);
router.get("/:id", equipmentController.getEquipmentById);

// Protected routes (require authentication)
router.post("/", verifyToken, equipmentController.createEquipment);
router.put("/:id", verifyToken, equipmentController.updateEquipment);
router.delete("/:id", verifyToken, equipmentController.deleteEquipment);

export default router;
