const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rental.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// All rental routes require authentication
router.use(verifyToken);

router.post('/', rentalController.createRental);
router.get('/', rentalController.getAllRentals);
router.get('/:id', rentalController.getRentalById);
router.put('/:id', rentalController.updateRental);
router.delete('/:id', rentalController.deleteRental);

// Specific actions
router.patch('/:id/payment', rentalController.updatePaymentStatus);
router.patch('/:id/status', rentalController.updateRentalStatus);

module.exports = router;
