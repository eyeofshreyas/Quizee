const Joi = require('joi');

const createQuizSchema = Joi.object({
  certificationId: Joi.string().required(),
  quizType: Joi.string().valid('practice', 'mock').required(),
  domainId: Joi.string().optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional()
});

const submitQuizSchema = Joi.object({
  sessionId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.string().required(),
      selected_option: Joi.number().required(),
      time_taken: Joi.number().optional()
    })
  ).min(1).required()
});

module.exports = { createQuizSchema, submitQuizSchema };