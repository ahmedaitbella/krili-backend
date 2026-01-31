const Joi = require('joi');

const createMaterielSchema = Joi.object({
  ownerId: Joi.string().required(),
  name: Joi.string().min(3).required(),
  description: Joi.string().allow(''),
  category: Joi.string().valid('camping', 'sports', 'tools', 'photography', 'audio', 'vehicles & bikes', 'electronics', 'other').required(),
  pricePerDay: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()),
  address: Joi.object({
    city: Joi.string().required(),
    neighborhood: Joi.string(),
    coords: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  }).required(),
  availabilityRanges: Joi.array().items(
    Joi.object({
      from: Joi.date().required(),
      to: Joi.date().required()
    })
  ),
  status: Joi.string().valid('available', 'rented', 'unavailable'),
  characteristics: Joi.object({
    brand: Joi.string(),
    year: Joi.number(),
    condition: Joi.string().valid('like new', 'good', 'fair')
  }),
  features: Joi.array().items(Joi.string()),
  rentalTerms: Joi.any()
});

const updateMaterielSchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().allow(''),
  category: Joi.string().valid('camping', 'sports', 'tools', 'photography', 'audio', 'vehicles & bikes', 'electronics', 'other'),
  pricePerDay: Joi.number().min(0),
  images: Joi.array().items(Joi.string().uri()),
  address: Joi.object({
    city: Joi.string(),
    neighborhood: Joi.string(),
    coords: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }),
  availabilityRanges: Joi.array().items(
    Joi.object({
      from: Joi.date(),
      to: Joi.date()
    })
  ),
  status: Joi.string().valid('available', 'rented', 'unavailable'),
  characteristics: Joi.object({
    brand: Joi.string(),
    year: Joi.number(),
    condition: Joi.string().valid('like new', 'good', 'fair')
  }),
  features: Joi.array().items(Joi.string()),
  rentalTerms: Joi.any()
});

module.exports = { createMaterielSchema, updateMaterielSchema };
