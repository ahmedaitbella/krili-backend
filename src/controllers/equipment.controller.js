import Equipment from "../models/Equipment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper to normalize equipment owner info
const normalizeOwnerOnEquipment = async (equipment) => {
  if (!equipment) return equipment;

  const obj =
    typeof equipment.toObject === "function"
      ? equipment.toObject()
      : { ...equipment };

  const ownerSrc = obj.ownerId || null;
  let owner = null;

  if (ownerSrc) {
    const id = ownerSrc._id || ownerSrc.id || ownerSrc.ownerId || null;
    if (!ownerSrc.name && id) {
      const userDoc = await User.findById(id)
        .select("firstName lastName name")
        .lean();
      if (userDoc) {
        ownerSrc.name =
          userDoc.name ||
          `${userDoc.firstName || ""} ${userDoc.lastName || ""}`.trim();
      }
    }
    const name = ownerSrc.name;

    owner = { id, name };
  }

  return { ...obj, owner };
};

// Create new equipment
const createEquipment = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get owner details
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Add owner details to equipment
    const equipmentData = {
      ...req.body,
      ownerId,
      owner: {
        id: owner._id,
        name: owner.name || `${owner.firstName} ${owner.lastName}`,
        avatar: owner.imageUrl,
      },
    };

    const equipment = await Equipment.create(equipmentData);
    return res
      .status(201)
      .json({ message: "Equipment created successfully", data: equipment });
  } catch (err) {
    next(err);
  }
};

// Get all equipments with filters
const getAllEquipments = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      city,
      status,
      ownerId,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (ownerId) query.ownerId = ownerId;
    if (city) query["address.city"] = new RegExp(city, "i");
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const equipments = await Equipment.find(query)
      .populate("ownerId", "firstName lastName email imageUrl rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Equipment.countDocuments(query);

    return res.json({
      data: await Promise.all(equipments.map(normalizeOwnerOnEquipment)),
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

// Get equipment by ID
const getEquipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }

    const equipment = await Equipment.findById(id).populate(
      "ownerId",
      "firstName lastName email phone imageUrl rating",
    );

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.json({ data: await normalizeOwnerOnEquipment(equipment) });
  } catch (err) {
    next(err);
  }
};

// Update equipment
const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment.ownerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this equipment" });
    }

    const updated = await Equipment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    return res.json({
      message: "Equipment updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Delete equipment
const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid equipment id" });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment.ownerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this equipment" });
    }
    await Equipment.findByIdAndDelete(id);

    return res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Search equipments by name or description
const searchEquipments = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const query = {
      $or: [{ name: new RegExp(q, "i") }, { description: new RegExp(q, "i") }],
    };

    const skip = (page - 1) * limit;
    const equipments = await Equipment.find(query)
      .populate("ownerId", "firstName lastName imageUrl rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Equipment.countDocuments(query);

    return res.json({
      data: await Promise.all(equipments.map(normalizeOwnerOnEquipment)),
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

// Get equipments by location (nearby)
const getEquipmentsByLocation = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000, page = 1, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    // Convert maxDistance (metres) to approximate degree deltas for bounding box
    // 1 degree latitude ≈ 111 km; longitude degree depends on latitude
    const maxDistKm = Number(maxDistance) / 1000;
    const latDelta = maxDistKm / 111;
    const lngDelta =
      maxDistKm / (111 * Math.cos((Number(lat) * Math.PI) / 180));

    const skip = (Number(page) - 1) * Number(limit);
    const query = {
      "address.coords.lat": {
        $gte: Number(lat) - latDelta,
        $lte: Number(lat) + latDelta,
      },
      "address.coords.lng": {
        $gte: Number(lng) - lngDelta,
        $lte: Number(lng) + lngDelta,
      },
    };

    const [equipments, total] = await Promise.all([
      Equipment.find(query)
        .populate("ownerId", "firstName lastName imageUrl rating")
        .skip(skip)
        .limit(Number(limit)),
      Equipment.countDocuments(query),
    ]);

    return res.json({
      data: await Promise.all(equipments.map(normalizeOwnerOnEquipment)),
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  searchEquipments,
  getEquipmentsByLocation,
};
