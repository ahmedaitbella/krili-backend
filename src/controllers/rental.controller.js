const Rental = require('../models/Rental');
const Materiel = require('../models/Materiel');

// Create new rental
const createRental = async (req, res, next) => {
  try {
    const { equipmentId, renterId, startDate, endDate } = req.body;

    // Check if materiel exists and is available
    const materiel = await Materiel.findById(equipmentId);
    if (!materiel) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (materiel.status !== 'available') {
      return res.status(400).json({ message: 'Equipment is not available' });
    }

    // Calculate rental details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const rentalAmount = numberOfDays * materiel.pricePerDay;
    const depositAmount = materiel.pricePerDay * 0.2; // 20% deposit
    const totalAmount = rentalAmount + depositAmount;

    const rentalData = {
      ...req.body,
      ownerId: materiel.ownerId,
      numberOfDays,
      rentalAmount,
      depositAmount,
      totalAmount
    };

    const rental = await Rental.create(rentalData);

    // Update materiel status
    await Materiel.findByIdAndUpdate(equipmentId, { 
      status: 'rented',
      $inc: { numberOfRentals: 1 }
    });

    return res.status(201).json({ 
      message: 'Rental created successfully', 
      data: rental 
    });
  } catch (err) {
    next(err);
  }
};

// Get all rentals with filters
const getAllRentals = async (req, res, next) => {
  try {
    const { 
      renterId, 
      ownerId, 
      equipmentId, 
      rentalStatus, 
      paymentStatus,
      page = 1,
      limit = 10 
    } = req.query;

    const query = {};
    if (renterId) query.renterId = renterId;
    if (ownerId) query.ownerId = ownerId;
    if (equipmentId) query.equipmentId = equipmentId;
    if (rentalStatus) query.rentalStatus = rentalStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const rentals = await Rental.find(query)
      .populate('renterId', 'firstName lastName email phone imageUrl')
      .populate('ownerId', 'firstName lastName email phone imageUrl')
      .populate('equipmentId', 'name category pricePerDay images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rental.countDocuments(query);

    return res.json({
      data: rentals,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get rental by ID
const getRentalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id)
      .populate('renterId', 'firstName lastName email phone imageUrl rating')
      .populate('ownerId', 'firstName lastName email phone imageUrl rating')
      .populate('equipmentId');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    return res.json({ data: rental });
  } catch (err) {
    next(err);
  }
};

// Update rental
const updateRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If rental is cancelled, update materiel status
    if (updates.rentalStatus === 'cancelled') {
      const rental = await Rental.findById(id);
      if (rental) {
        await Materiel.findByIdAndUpdate(rental.equipmentId, { 
          status: 'available' 
        });
      }
    }

    // If rental is completed, update materiel status
    if (updates.rentalStatus === 'completed') {
      const rental = await Rental.findById(id);
      if (rental) {
        await Materiel.findByIdAndUpdate(rental.equipmentId, { 
          status: 'available' 
        });
      }
    }

    const rental = await Rental.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('renterId ownerId equipmentId');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    return res.json({ message: 'Rental updated successfully', data: rental });
  } catch (err) {
    next(err);
  }
};

// Delete rental
const deleteRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Update materiel status back to available
    await Materiel.findByIdAndUpdate(rental.equipmentId, { 
      status: 'available',
      $inc: { numberOfRentals: -1 }
    });

    await Rental.findByIdAndDelete(id);

    return res.json({ message: 'Rental deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Update payment status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, stripeSessionId } = req.body;

    const rental = await Rental.findByIdAndUpdate(
      id,
      { $set: { paymentStatus, stripeSessionId } },
      { new: true }
    );

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    return res.json({ message: 'Payment status updated', data: rental });
  } catch (err) {
    next(err);
  }
};

// Update rental status
const updateRentalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rentalStatus } = req.body;

    const rental = await Rental.findByIdAndUpdate(
      id,
      { $set: { rentalStatus } },
      { new: true }
    );

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    return res.json({ message: 'Rental status updated', data: rental });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRental,
  getAllRentals,
  getRentalById,
  updateRental,
  deleteRental,
  updatePaymentStatus,
  updateRentalStatus
};
