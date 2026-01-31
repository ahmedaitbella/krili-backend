const Materiel = require('../models/Materiel');
const User = require('../models/User');

// Create new materiel
const createMateriel = async (req, res, next) => {
  try {
    const { ownerId } = req.body;
    
    // Get owner details
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Add owner details to materiel
    const materielData = {
      ...req.body,
      owner: {
        id: owner._id,
        name: owner.name || `${owner.firstName} ${owner.lastName}`,
        avatar: owner.imageUrl
      }
    };

    const materiel = await Materiel.create(materielData);
    return res.status(201).json({ message: 'Materiel created successfully', data: materiel });
  } catch (err) {
    next(err);
  }
};

// Get all materiels with filters
const getAllMateriels = async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      city, 
      status, 
      ownerId,
      page = 1,
      limit = 10 
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (ownerId) query.ownerId = ownerId;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const materiels = await Materiel.find(query)
      .populate('ownerId', 'firstName lastName email imageUrl rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Materiel.countDocuments(query);

    return res.json({
      data: materiels,
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

// Get materiel by ID
const getMaterielById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const materiel = await Materiel.findById(id)
      .populate('ownerId', 'firstName lastName email phone imageUrl rating');
    
    if (!materiel) {
      return res.status(404).json({ message: 'Materiel not found' });
    }

    return res.json({ data: materiel });
  } catch (err) {
    next(err);
  }
};

// Update materiel
const updateMateriel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const materiel = await Materiel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!materiel) {
      return res.status(404).json({ message: 'Materiel not found' });
    }

    return res.json({ message: 'Materiel updated successfully', data: materiel });
  } catch (err) {
    next(err);
  }
};

// Delete materiel
const deleteMateriel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const materiel = await Materiel.findByIdAndDelete(id);

    if (!materiel) {
      return res.status(404).json({ message: 'Materiel not found' });
    }

    return res.json({ message: 'Materiel deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Search materiels by name or description
const searchMateriels = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const query = {
      $or: [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ]
    };

    const skip = (page - 1) * limit;
    const materiels = await Materiel.find(query)
      .populate('ownerId', 'firstName lastName imageUrl rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Materiel.countDocuments(query);

    return res.json({
      data: materiels,
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

// Get materiels by location (nearby)
const getMaterielsByLocation = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000, page = 1, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const skip = (page - 1) * limit;
    const materiels = await Materiel.find({
      'address.coords': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(maxDistance)
        }
      }
    })
      .populate('ownerId', 'firstName lastName imageUrl rating')
      .skip(skip)
      .limit(Number(limit));

    return res.json({ data: materiels });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMateriel,
  getAllMateriels,
  getMaterielById,
  updateMateriel,
  deleteMateriel,
  searchMateriels,
  getMaterielsByLocation
};
