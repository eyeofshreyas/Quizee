const { createQuiz, submitQuiz } = require('../services/quizService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const create = async (req, res, next) => {
  try {
    const { certificationId, quizType, domainId, difficulty } = req.body;
    const result = await createQuiz({
      userId: req.user._id,
      certificationId,
      quizType,
      domainId,
      difficulty
    });
    res.status(201).json(new ApiResponse(201, result, 'Quiz created successfully'));
  } catch (err) {
    next(err);
  }
};

const submit = async (req, res, next) => {
  try {
    const { sessionId, answers } = req.body;
    const result = await submitQuiz({
      userId: req.user._id,
      sessionId,
      answers
    });
    res.status(200).json(new ApiResponse(200, result, 'Quiz submitted successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, submit };