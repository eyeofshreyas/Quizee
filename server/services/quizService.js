const quizEngine = require('../logic/quizEngine/createQuiz');
const submitQuizEngine = require('../logic/quizEngine/submitQuiz');
const QuizSession = require('../models/QuizSession');
const ApiError = require('../utils/ApiError');

const createQuiz = async ({ userId, certificationId, quizType, domainId, difficulty }) => {
  return quizEngine.createQuiz({ userId, certificationId, quizType, domainId, difficulty });
};

const submitQuiz = async ({ userId, sessionId, answers }) => {
  const sessionDoc = await QuizSession.findById(sessionId);
  if (!sessionDoc) throw new ApiError(404, 'Quiz session not found');

  if (sessionDoc.user_id.toString() !== userId.toString()) {
    throw new ApiError(403, 'This quiz session does not belong to you');
  }
  if (sessionDoc.status === 'COMPLETED') {
    throw new ApiError(400, 'This quiz session has already been submitted');
  }

  const quizSession = {
    sessionId: sessionDoc._id,
    certificationId: sessionDoc.cert_id,
    quizType: sessionDoc.quiz_type,
    mocktestId: null
  };

  return submitQuizEngine.submitQuiz({ userId, quizSession, answers });
};

module.exports = { createQuiz, submitQuiz };