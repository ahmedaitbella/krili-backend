const Joi = require('joi');

const createEvaluationSchema = Joi.object({
  locationId: Joi.string(),
  evaluatorId: Joi.string().required(),
  evaluateeId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow(''),
  type: Joi.string().valid('tenant_to_owner', 'owner_to_tenant').required()
});

const updateEvaluationSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().allow(''),
  type: Joi.string().valid('tenant_to_owner', 'owner_to_tenant')
});

module.exports = {
  createEvaluationSchema,
  updateEvaluationSchema
};
