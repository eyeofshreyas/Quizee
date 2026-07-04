const Joi = require('joi');

const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('INR'),
  plan_id: Joi.string().required()
});

module.exports = { paymentSchema };