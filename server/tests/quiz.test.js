// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/quiz.test.js
const assert = require('assert');

const CertificationModel = require('../models/Certification');
const QuestionModel = require('../models/Question');
const QuizSessionModel = require('../models/QuizSession');
const UserModel = require('../models/User');
const subscriptionEngine = require('../logic/subscription/subscriptionEngine');
const createQuizEngine = require('../logic/quizEngine/createQuiz');

async function testCreateQuizReturnsFullQuestionContent() {
  const userId = '507f1f77bcf86cd799439020';
  const certId = '507f1f77bcf86cd799439021';
  const questionId = '507f1f77bcf86cd799439022';

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
  QuizSessionModel.create = async (doc) => ({ _id: 'session1', createdAt: new Date(), ...doc });
  subscriptionEngine.canStartQuiz = async () => ({ allowed: true });

  const result = await createQuizEngine.createQuiz({
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
  console.log('createQuiz question-sanitization self-check passed');
}

testCreateQuizReturnsFullQuestionContent();
