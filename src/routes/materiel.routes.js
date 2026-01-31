const express = require('express');
const router = express.Router();
const materielController = require('../controllers/materiel.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', materielController.getAllMateriels);
router.get('/search', materielController.searchMateriels);
router.get('/nearby', materielController.getMaterielsByLocation);
router.get('/:id', materielController.getMaterielById);

// Protected routes (require authentication)
router.post('/', verifyToken, materielController.createMateriel);
router.put('/:id', verifyToken, materielController.updateMateriel);
router.delete('/:id', verifyToken, materielController.deleteMateriel);

module.exports = router;
