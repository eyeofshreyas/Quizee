const Joi = require('joi');

const subscribeSchema = Joi.object({
  planId: Joi.string().required()
});

module.exports = { subscribeSchema };