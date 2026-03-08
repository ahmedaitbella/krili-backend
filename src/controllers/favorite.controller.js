import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";

// Get user favorites
const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

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
    const userId = req.user.id;
    const { equipmentId } = req.body;

    if (!equipmentId) {
      return res.status(400).json({ message: "equipmentId is required" });
    }

    if (!mongoose.isValidObjectId(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipmentId" });
    }

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = await Favorite.create({
        userId,
        equipmentIds: [equipmentId],
      });
    } else {
      // Check if already in favorites (compare as strings to handle ObjectId)
      const alreadyIn = favorite.equipmentIds.some(
        (id) => id.toString() === equipmentId,
      );
      if (alreadyIn) {
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
    const userId = req.user.id;
    const { equipmentId } = req.body;

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
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndUpdate(
      { userId },
      { $set: { equipmentIds: [] } },
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
    const userId = req.user.id;
    const { equipmentId } = req.body;

    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      favorite = await Favorite.create({
        userId,
        equipmentIds: [equipmentId],
      });
      await favorite.populate(
        "equipmentIds",
        "name category pricePerDay images address owner rating",
      );
      return res.json({
        message: "Added to favorites",
        data: favorite,
        action: "added",
      });
    }

    // ensure equipmentIds is an array to avoid runtime crashes
    favorite.equipmentIds = Array.isArray(favorite.equipmentIds)
      ? favorite.equipmentIds
      : [];

    const index = favorite.equipmentIds.findIndex(
      (id) => id.toString() === equipmentId,
    );

    if (index > -1) {
      favorite.equipmentIds.splice(index, 1);
      await favorite.save();
      await favorite.populate(
        "equipmentIds",
        "name category pricePerDay images address owner rating",
      );
      return res.json({
        message: "Removed from favorites",
        data: favorite,
        action: "removed",
      });
    } else {
      favorite.equipmentIds.push(equipmentId);
      await favorite.save();
      await favorite.populate(
        "equipmentIds",
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
