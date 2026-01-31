const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  firstName: Joi.string().min(2),
  lastName: Joi.string().min(2),
  phone: Joi.string(),
  imageUrl: Joi.string().uri(),
  address: Joi.object({
    city: Joi.string(),
    neighborhood: Joi.string(),
    coords: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    })
  }),
  role: Joi.string().valid('tenant', 'owner', 'both', 'user')
});

module.exports = {
  updateUserSchema
};
