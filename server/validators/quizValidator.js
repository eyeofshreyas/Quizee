const Joi = require('joi');

const createQuizSchema = Joi.object({
  certId: Joi.string().required(),
  domainId: Joi.string().optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  numQuestions: Joi.number().integer().min(1).max(100).optional()
});

const submitQuizSchema = Joi.object({
  certId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.string().required(),
      selected_option: Joi.number().required()
    })
  ).min(1).required(),
  timeTaken: Joi.number().optional()
});

module.exports = { createQuizSchema, submitQuizSchema };