const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All favorite routes require authentication
router.use(verifyToken);

router.get('/:userId', favoriteController.getUserFavorites);
router.post('/add', favoriteController.addToFavorites);
router.post('/remove', favoriteController.removeFromFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.delete('/:userId/clear', favoriteController.clearFavorites);

module.exports = router;
