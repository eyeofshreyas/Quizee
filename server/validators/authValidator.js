const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).optional(),
  profileImage: Joi.string().uri().allow('').optional()
}).min(1); // at least one field must be provided

module.exports = { registerSchema, loginSchema, updateProfileSchema };