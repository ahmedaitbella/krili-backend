const Joi = require('joi');

const addToFavoritesSchema = Joi.object({
  userId: Joi.string().required(),
  materialId: Joi.string().required()
});

const removeFromFavoritesSchema = Joi.object({
  userId: Joi.string().required(),
  materialId: Joi.string().required()
});

const toggleFavoriteSchema = Joi.object({
  userId: Joi.string().required(),
  materialId: Joi.string().required()
});

module.exports = {
  addToFavoritesSchema,
  removeFromFavoritesSchema,
  toggleFavoriteSchema
};
