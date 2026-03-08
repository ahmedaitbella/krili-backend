import express from "express";
import evaluationController from "../controllers/evaluation.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createEvaluationSchema,
  updateEvaluationSchema,
} from "../validations/evaluation.validation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// All evaluation routes require authentication
router.use(verifyToken);

router.post(
  "/",
  validate(createEvaluationSchema),
  evaluationController.createEvaluation,
);
router.get("/", evaluationController.getAllEvaluations);
router.get("/user/:userId", evaluationController.getUserEvaluations);
router.get("/:id", evaluationController.getEvaluationById);
router.put(
  "/:id",
  validate(updateEvaluationSchema),
  evaluationController.updateEvaluation,
);
router.delete("/:id", evaluationController.deleteEvaluation);

export default router;
