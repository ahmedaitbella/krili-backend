import Favorite from "../models/Favorite.js";

// Get user favorites
const getUserFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;

    let favorite = await Favorite.findOne({ userId }).populate(
      "equipmentIds",
      "name category pricePerDay images address owner rating",
    );

    if (!favorite) {
      favorite = await Favorite.create({ userId, equipmentIds: [] });
    }

    return res.json({ data: favorite });
  } catch (err) {
    next(err);
  }
};

// Add equipment to favorites
const addToFavorites = async (req, res, next) => {
  try {
    const { userId, equipmentId } = req.body;

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = await Favorite.create({
        userId,
        equipmentIds: [equipmentId],
      });
    } else {
      // Check if already in favorites
      if (favorite.equipmentIds.includes(equipmentId)) {
        return res
          .status(400)
          .json({ message: "Equipment already in favorites" });
      }

      favorite.equipmentIds.push(equipmentId);
      await favorite.save();
    }

    await favorite.populate(
      "equipmentIds",
      "name category pricePerDay images address owner rating",
    );

    return res.json({
      message: "Added to favorites successfully",
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
};

// Remove equipment from favorites
const removeFromFavorites = async (req, res, next) => {
  try {
    const { userId, equipmentId } = req.body;

    const favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      return res.status(404).json({ message: "Favorites not found" });
    }

    favorite.equipmentIds = favorite.equipmentIds.filter(
      (id) => id.toString() !== equipmentId,
    );
    await favorite.save();

    await favorite.populate(
      "equipmentIds",
      "name category pricePerDay images address owner rating",
    );

    return res.json({
      message: "Removed from favorites successfully",
      data: favorite,
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
      { new: true },
    );

    if (!favorite) {
      return res.status(404).json({ message: "Favorites not found" });
    }

    return res.json({
      message: "Favorites cleared successfully",
      data: favorite,
    });
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
        materialIds: [materialId],
      });
      await favorite.populate(
        "materialIds",
        "name category pricePerDay images address owner rating",
      );
      return res.json({
        message: "Added to favorites",
        data: favorite,
        action: "added",
      });
    }

    const index = favorite.materialIds.findIndex(
      (id) => id.toString() === materialId,
    );

    if (index > -1) {
      favorite.materialIds.splice(index, 1);
      await favorite.save();
      await favorite.populate(
        "materialIds",
        "name category pricePerDay images address owner rating",
      );
      return res.json({
        message: "Removed from favorites",
        data: favorite,
        action: "removed",
      });
    } else {
      favorite.materialIds.push(materialId);
      await favorite.save();
      await favorite.populate(
        "materialIds",
        "name category pricePerDay images address owner rating",
      );
      return res.json({
        message: "Added to favorites",
        data: favorite,
        action: "added",
      });
    }
  } catch (err) {
    next(err);
  }
};

export {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  toggleFavorite,
};

export default {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  toggleFavorite,
};
