const Evaluation = require('../models/Evaluation');
const User = require('../models/User');

// Create new evaluation
const createEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.create(req.body);

    // Update evaluatee's rating
    const evaluations = await Evaluation.find({ evaluateeId: req.body.evaluateeId });
    const avgRating = evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length;
    
    await User.findByIdAndUpdate(req.body.evaluateeId, { 
      rating: avgRating.toFixed(1) 
    });

    return res.status(201).json({ 
      message: 'Evaluation created successfully', 
      data: evaluation 
    });
  } catch (err) {
    next(err);
  }
};

// Get all evaluations with filters
const getAllEvaluations = async (req, res, next) => {
  try {
    const { 
      evaluatorId, 
      evaluateeId, 
      locationId, 
      type,
      page = 1,
      limit = 10 
    } = req.query;

    const query = {};
    if (evaluatorId) query.evaluatorId = evaluatorId;
    if (evaluateeId) query.evaluateeId = evaluateeId;
    if (locationId) query.locationId = locationId;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const evaluations = await Evaluation.find(query)
      .populate('evaluatorId', 'firstName lastName imageUrl')
      .populate('evaluateeId', 'firstName lastName imageUrl rating')
      .populate('locationId', 'equipmentId startDate endDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Evaluation.countDocuments(query);

    return res.json({
      data: evaluations,
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

// Get evaluation by ID
const getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await Evaluation.findById(id)
      .populate('evaluatorId', 'firstName lastName imageUrl')
      .populate('evaluateeId', 'firstName lastName imageUrl rating')
      .populate('locationId');

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    return res.json({ data: evaluation });
  } catch (err) {
    next(err);
  }
};

// Update evaluation
const updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const evaluation = await Evaluation.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('evaluatorId evaluateeId locationId');

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Recalculate rating if rating changed
    if (updates.rating) {
      const evaluations = await Evaluation.find({ evaluateeId: evaluation.evaluateeId });
      const avgRating = evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length;
      await User.findByIdAndUpdate(evaluation.evaluateeId, { 
        rating: avgRating.toFixed(1) 
      });
    }

    return res.json({ message: 'Evaluation updated successfully', data: evaluation });
  } catch (err) {
    next(err);
  }
};

// Delete evaluation
const deleteEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await Evaluation.findByIdAndDelete(id);

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Recalculate rating after deletion
    const evaluations = await Evaluation.find({ evaluateeId: evaluation.evaluateeId });
    if (evaluations.length > 0) {
      const avgRating = evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length;
      await User.findByIdAndUpdate(evaluation.evaluateeId, { 
        rating: avgRating.toFixed(1) 
      });
    } else {
      await User.findByIdAndUpdate(evaluation.evaluateeId, { rating: 0 });
    }

    return res.json({ message: 'Evaluation deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get user's received evaluations
const getUserEvaluations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const evaluations = await Evaluation.find({ evaluateeId: userId })
      .populate('evaluatorId', 'firstName lastName imageUrl')
      .sort({ createdAt: -1 });

    return res.json({ data: evaluations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvaluation,
  getAllEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getUserEvaluations
};
