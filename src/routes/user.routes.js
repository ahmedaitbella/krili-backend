const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public routes
router.get('/search', userController.searchUsers);

// Protected routes
router.use(verifyToken);

// Current user profile
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// Admin routes (all users)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
