// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/quiz.test.js
const assert = require('assert');

const CertificationModel = require('../models/Certification');
const QuestionModel = require('../models/Question');
const QuizSessionModel = require('../models/QuizSession');
const UserModel = require('../models/User');
const subscriptionEngine = require('../logic/subscription/subscriptionEngine');
const createQuizEngine = require('../logic/quizEngine/createQuiz');
const quizService = require('../services/quizService');

async function testServiceCreateQuizReturnsFullQuestionContent() {
  const userId = '507f1f77bcf86cd799439020';
  const certId = '507f1f77bcf86cd799439021';
  const questionId = '507f1f77bcf86cd799439022';

  const fullQuestion = {
    _id: questionId,
    text: 'Which service provides managed DDoS protection?',
    options: ['AWS Shield', 'AWS WAF', 'Amazon Inspector', 'AWS KMS'],
    correct_index: 0,
    explanation: 'AWS Shield protects against DDoS attacks.',
    domain_id: 'domain1',
    difficulty: 'Medium'
  };

  UserModel.findOneAndUpdate = async () => ({ _id: userId });
  UserModel.findByIdAndUpdate = async () => ({ _id: userId });
  CertificationModel.findById = async () => ({
    _id: certId,
    totalQuestions: 1,
    durationMinutes: 30
  });
  // used inside the logic engine to sample questions
  QuestionModel.aggregate = async () => [fullQuestion];
  // used by the service-layer enrichment
  QuestionModel.find = async () => [fullQuestion];
  QuizSessionModel.create = async (doc) => ({ _id: 'session1', createdAt: new Date(), ...doc });
  subscriptionEngine.canStartQuiz = async () => ({ allowed: true });

  const result = await quizService.createQuiz({
    userId,
    certificationId: certId,
    quizType: 'practice'
  });

  const returnedQuestion = result.quizSession.questions[0];
  assert.strictEqual(returnedQuestion._id, questionId);
  assert.strictEqual(returnedQuestion.text, 'Which service provides managed DDoS protection?');
  assert.deepStrictEqual(returnedQuestion.options, ['AWS Shield', 'AWS WAF', 'Amazon Inspector', 'AWS KMS']);
  assert.strictEqual(returnedQuestion.domain_id, 'domain1');
  assert.strictEqual(returnedQuestion.difficulty, 'Medium');
  assert.strictEqual(returnedQuestion.correct_index, undefined, 'correct_index must not be sent to the client before submit');
  assert.strictEqual(returnedQuestion.explanation, undefined, 'explanation must not be sent to the client before submit');
  console.log('quizService.createQuiz question-sanitization self-check passed');
}

async function testEngineCreateQuizStaysIdOnly() {
  // Regression guard: server/logic/quizEngine/createQuiz.js's own return
  // value must stay ID-only. Direct composers of the logic layer
  // (server/logic/verify.js) rely on quizSession.questions being an array
  // of ObjectIds, not enriched objects — that got broken once already
  // (see commit 703729d) when the enrichment was put in the engine instead
  // of the service layer.
  const userId = '507f1f77bcf86cd799439030';
  const certId = '507f1f77bcf86cd799439031';
  const questionId = '507f1f77bcf86cd799439032';

  UserModel.findOneAndUpdate = async () => ({ _id: userId });
  UserModel.findByIdAndUpdate = async () => ({ _id: userId });
  CertificationModel.findById = async () => ({
    _id: certId,
    totalQuestions: 1,
    durationMinutes: 30
  });
  QuestionModel.aggregate = async () => [{
    _id: questionId,
    text: 'Which service provides managed DDoS protection?',
    options: ['AWS Shield', 'AWS WAF', 'Amazon Inspector', 'AWS KMS'],
    correct_index: 0,
    explanation: 'AWS Shield protects against DDoS attacks.',
    domain_id: 'domain1',
    difficulty: 'Medium'
  }];
  QuizSessionModel.create = async (doc) => ({ _id: 'session2', createdAt: new Date(), ...doc });
  subscriptionEngine.canStartQuiz = async () => ({ allowed: true });

  const result = await createQuizEngine.createQuiz({
    userId,
    certificationId: certId,
    quizType: 'practice'
  });

  assert.strictEqual(result.quizSession.questions.length, 1);
  assert.strictEqual(
    result.quizSession.questions[0],
    questionId,
    'logic-engine quizSession.questions must stay ID-only, enrichment belongs in the service layer'
  );
  console.log('createQuizEngine ID-only-contract self-check passed');
}

(async () => {
  await testServiceCreateQuizReturnsFullQuestionContent();
  await testEngineCreateQuizStaysIdOnly();
})();
