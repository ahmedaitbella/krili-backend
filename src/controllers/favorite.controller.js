const Favorite = require('../models/Favorite');

// Get user favorites
const getUserFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    let favorite = await Favorite.findOne({ userId })
      .populate('materialIds', 'name category pricePerDay images address owner rating');

    if (!favorite) {
      favorite = await Favorite.create({ userId, materialIds: [] });
    }

    return res.json({ data: favorite });
  } catch (err) {
    next(err);
  }
};

// Add materiel to favorites
const addToFavorites = async (req, res, next) => {
  try {
    const { userId, materialId } = req.body;

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = await Favorite.create({ 
        userId, 
        materialIds: [materialId] 
      });
    } else {
      // Check if already in favorites
      if (favorite.materialIds.includes(materialId)) {
        return res.status(400).json({ message: 'Material already in favorites' });
      }

      favorite.materialIds.push(materialId);
      await favorite.save();
    }

    await favorite.populate('materialIds', 'name category pricePerDay images address owner rating');

    return res.json({ 
      message: 'Added to favorites successfully', 
      data: favorite 
    });
  } catch (err) {
    next(err);
  }
};

// Remove materiel from favorites
const removeFromFavorites = async (req, res, next) => {
  try {
    const { userId, materialId } = req.body;

    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorites not found' });
    }

    favorite.materialIds = favorite.materialIds.filter(
      id => id.toString() !== materialId
    );
    await favorite.save();

    await favorite.populate('materialIds', 'name category pricePerDay images address owner rating');

    return res.json({ 
      message: 'Removed from favorites successfully', 
      data: favorite 
    });
  } catch (err) {
    next(err);
  }
};

// Clear all favorites
const clearFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const favorite = await Favorite.findOneAndUpdate(
      { userId },
      { $set: { materialIds: [] } },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ message: 'Favorites not found' });
    }

    return res.json({ message: 'Favorites cleared successfully', data: favorite });
  } catch (err) {
    next(err);
  }
};

// Toggle favorite (add or remove)
const toggleFavorite = async (req, res, next) => {
  try {
    const { userId, materialId } = req.body;

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = await Favorite.create({ 
        userId, 
        materialIds: [materialId] 
      });
      await favorite.populate('materialIds', 'name category pricePerDay images address owner rating');
      return res.json({ 
        message: 'Added to favorites', 
        data: favorite,
        action: 'added'
      });
    }

    const index = favorite.materialIds.findIndex(
      id => id.toString() === materialId
    );

    if (index > -1) {
      favorite.materialIds.splice(index, 1);
      await favorite.save();
      await favorite.populate('materialIds', 'name category pricePerDay images address owner rating');
      return res.json({ 
        message: 'Removed from favorites', 
        data: favorite,
        action: 'removed'
      });
    } else {
      favorite.materialIds.push(materialId);
      await favorite.save();
      await favorite.populate('materialIds', 'name category pricePerDay images address owner rating');
      return res.json({ 
        message: 'Added to favorites', 
        data: favorite,
        action: 'added'
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  toggleFavorite
};
