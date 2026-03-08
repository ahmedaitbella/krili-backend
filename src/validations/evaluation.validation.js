import Joi from "joi";

const createEvaluationSchema = Joi.object({
  locationId: Joi.string(),
  evaluatorId: Joi.string(), // set server-side from req.user.id
  evaluateeId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow(""),
  type: Joi.string().valid("tenant_to_owner", "owner_to_tenant").required(),
});

const updateEvaluationSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().allow(""),
  type: Joi.string().valid("tenant_to_owner", "owner_to_tenant"),
});

export { createEvaluationSchema, updateEvaluationSchema };
