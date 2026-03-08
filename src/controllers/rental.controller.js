import Rental from "../models/Rental.js";
import Equipment from "../models/Equipment.js";
import Payment from "../models/Payment.js";

// Create new rental
const createRental = async (req, res, next) => {
  try {
    const { equipmentId, startDate, endDate, stripePaymentIntentId } = req.body;
    const renterId = req.user.id;

    // Check if equipment exists and is available
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.status !== "available") {
      return res.status(400).json({ message: "Equipment is not available" });
    }

    // ── Date overlap check ────────────────────────────────────────────────
    // Reject if there is already an active rental whose dates intersect with
    // the requested window.  Two intervals [s1,e1] and [s2,e2] overlap when
    // s1 < e2 AND e1 > s2.
    const overlapping = await Rental.findOne({
      equipmentId,
      rentalStatus: { $nin: ["cancelled", "completed"] },
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    });
    if (overlapping) {
      return res.status(409).json({
        message:
          "Equipment is already booked for the selected dates. Please choose different dates.",
        conflictingRental: {
          startDate: overlapping.startDate,
          endDate: overlapping.endDate,
        },
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    // Calculate rental details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const rentalAmount = numberOfDays * equipment.pricePerDay;
    const depositAmount = equipment.pricePerDay * 0.2; // 20% deposit
    const totalAmount = rentalAmount + depositAmount;

    const rentalData = {
      ...req.body,
      renterId,
      ownerId: equipment.ownerId,
      numberOfDays,
      rentalAmount,
      depositAmount,
      totalAmount,
      // If a Stripe PaymentIntent was provided, store it and mark as paid
      ...(stripePaymentIntentId && {
        stripeSessionId: stripePaymentIntentId,
        paymentStatus: "paid",
      }),
    };

    const rental = await Rental.create(rentalData);

    // Link the rental to its Payment record (if paid via Stripe)
    if (stripePaymentIntentId) {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId },
        { rentalId: rental._id },
      );
    }

    // Update equipment status
    await Equipment.findByIdAndUpdate(equipmentId, {
      status: "rented",
      $inc: { numberOfRentals: 1 },
    });

    return res.status(201).json({
      message: "Rental created successfully",
      data: rental,
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
      limit = 10,
    } = req.query;

    const query = {};
    if (renterId) query.renterId = renterId;
    if (ownerId) query.ownerId = ownerId;
    if (equipmentId) query.equipmentId = equipmentId;
    if (rentalStatus) query.rentalStatus = rentalStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const rentals = await Rental.find(query)
      .populate("renterId", "name email phone imageUrl")
      .populate("ownerId", "name email phone imageUrl")
      .populate("equipmentId", "name category pricePerDay images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rental.countDocuments(query);

    return res.json({
      data: rentals,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
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
      .populate("renterId", "name email phone imageUrl rating")
      .populate("ownerId", "name email phone imageUrl rating")
      .populate("equipmentId");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
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

    // If rental is cancelled, update equipment status
    if (updates.rentalStatus === "cancelled") {
      const rental = await Rental.findById(id);
      if (rental) {
        await Equipment.findByIdAndUpdate(rental.equipmentId, {
          status: "available",
        });
      }
    }

    // If rental is completed, update equipment status
    if (updates.rentalStatus === "completed") {
      const rental = await Rental.findById(id);
      if (rental) {
        await Equipment.findByIdAndUpdate(rental.equipmentId, {
          status: "available",
        });
      }
    }

    const rental = await Rental.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("renterId ownerId equipmentId");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    return res.json({ message: "Rental updated successfully", data: rental });
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
      return res.status(404).json({ message: "Rental not found" });
    }

    // Update equipment status back to available
    await Equipment.findByIdAndUpdate(rental.equipmentId, {
      status: "available",
      $inc: { numberOfRentals: -1 },
    });

    await Rental.findByIdAndDelete(id);

    return res.json({ message: "Rental deleted successfully" });
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
      { new: true },
    );

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    return res.json({ message: "Payment status updated", data: rental });
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
      { new: true },
    );

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    return res.json({ message: "Rental status updated", data: rental });
  } catch (err) {
    next(err);
  }
};

export {
  createRental,
  getAllRentals,
  getRentalById,
  updateRental,
  deleteRental,
  updatePaymentStatus,
  updateRentalStatus,
};

export default {
  createRental,
  getAllRentals,
  getRentalById,
  updateRental,
  deleteRental,
  updatePaymentStatus,
  updateRentalStatus,
};
