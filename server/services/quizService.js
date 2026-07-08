const quizEngine = require('../logic/quizEngine/createQuiz');
const submitQuizEngine = require('../logic/quizEngine/submitQuiz');
const timer = require('../logic/quizEngine/timer');
const QuizSession = require('../models/QuizSession');
const QuestionModel = require('../models/Question');
const ApiError = require('../utils/ApiError');

// HTTP-response shaping: the logic engine returns quizSession.questions as
// ID-only (its real contract, relied on by verify.js and other direct
// composers). The API response needs full sanitized question content, so
// that enrichment happens here in the service layer, not in the engine.
const createQuiz = async ({ userId, certificationId, quizType, domainId, difficulty }) => {
  const result = await quizEngine.createQuiz({ userId, certificationId, quizType, domainId, difficulty });

  const ids = result.quizSession.questions;
  const found = await QuestionModel.find({ _id: { $in: ids } });
  const byId = new Map(found.map(q => [q._id.toString(), q]));

  result.quizSession.questions = ids.map(id => {
    const q = byId.get(id.toString());
    return {
      _id: q._id,
      text: q.text,
      options: q.options,
      domain_id: q.domain_id,
      difficulty: q.difficulty
    };
  });

  return result;
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

  if (await timer.checkExpiration(sessionDoc._id)) {
    sessionDoc.status = 'COMPLETED';
    await sessionDoc.save();
    throw new ApiError(400, 'Quiz time has expired; this session was closed without being scored');
  }

  const quizSession = {
    sessionId: sessionDoc._id,
    certificationId: sessionDoc.cert_id,
    quizType: sessionDoc.quiz_type,
    mocktestId: null,
    questions: sessionDoc.questions
  };

  return submitQuizEngine.submitQuiz({ userId, quizSession, answers });
};

module.exports = { createQuiz, submitQuiz };