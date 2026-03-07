import Joi from "joi";

const addToFavoritesSchema = Joi.object({
  userId: Joi.string().required(),
  equipmentId: Joi.string().required(),
});

const removeFromFavoritesSchema = Joi.object({
  userId: Joi.string().required(),
  equipmentId: Joi.string().required(),
});

const toggleFavoriteSchema = Joi.object({
  userId: Joi.string().required(),
  materialId: Joi.string().required(),
});

export {
  addToFavoritesSchema,
  removeFromFavoritesSchema,
  toggleFavoriteSchema,
};
