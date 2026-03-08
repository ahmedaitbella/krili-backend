import express from "express";
import equipmentController from "../controllers/equipment.controller.js";
import { verifyToken, authorizeOwner } from "../middlewares/auth.middleware.js";
import Equipment from "../models/Equipment.js";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from "../validations/equipment.validation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// Public routes
router.get("/", equipmentController.getAllEquipments);
router.get("/search", equipmentController.searchEquipments);
router.get("/nearby", equipmentController.getEquipmentsByLocation);
router.get("/:id", equipmentController.getEquipmentById);

// Protected routes (require authentication)
router.post(
  "/",
  verifyToken,
  validate(createEquipmentSchema),
  equipmentController.createEquipment,
);
router.put(
  "/:id",
  verifyToken,
  authorizeOwner(Equipment, "ownerId"),
  validate(updateEquipmentSchema),
  equipmentController.updateEquipment,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeOwner(Equipment, "ownerId"),
  equipmentController.deleteEquipment,
);

export default router;
