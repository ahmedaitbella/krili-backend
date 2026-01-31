const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All evaluation routes require authentication
router.use(verifyToken);

router.post('/', evaluationController.createEvaluation);
router.get('/', evaluationController.getAllEvaluations);
router.get('/user/:userId', evaluationController.getUserEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.put('/:id', evaluationController.updateEvaluation);
router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router;
