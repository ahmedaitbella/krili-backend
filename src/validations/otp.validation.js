const Joi = require('joi');

const sendOTPValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  return schema.validate(data);
};

const verifyOTPValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
  });
  return schema.validate(data);
};

const enableTOTPValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  return schema.validate(data);
};

const verifyTOTPTokenValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().length(6).required()
  });
  return schema.validate(data);
};

const disableTOTPValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  return schema.validate(data);
};

module.exports = {
  sendOTPValidation,
  verifyOTPValidation,
  enableTOTPValidation,
  verifyTOTPTokenValidation,
  disableTOTPValidation
};
