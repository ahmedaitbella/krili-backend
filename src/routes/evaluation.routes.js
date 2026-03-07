import express from "express";
import evaluationController from "../controllers/evaluation.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All evaluation routes require authentication
router.use(verifyToken);

router.post("/", evaluationController.createEvaluation);
router.get("/", evaluationController.getAllEvaluations);
router.get("/user/:userId", evaluationController.getUserEvaluations);
router.get("/:id", evaluationController.getEvaluationById);
router.put("/:id", evaluationController.updateEvaluation);
router.delete("/:id", evaluationController.deleteEvaluation);

export default router;
