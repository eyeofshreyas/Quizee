// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/quizConcurrency.test.js
const assert = require('assert');

const QuizSession = require('../models/QuizSession');
const User = require('../models/User');
const timer = require('../logic/quizEngine/timer');
const quizService = require('../services/quizService');
const createQuizEngine = require('../logic/quizEngine/createQuiz');

async function testTimerExpiryBlocksSubmit() {
  const sessionId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439012';
  let saved = false;

  QuizSession.findById = async () => ({
    _id: sessionId,
    user_id: { toString: () => userId },
    status: 'ACTIVE',
    questions: [],
    cert_id: 'cert1',
    quiz_type: 'mock',
    save: async function () { saved = true; this.status = 'COMPLETED'; }
  });
  timer.checkExpiration = async () => true;

  let threw = false;
  try {
    await quizService.submitQuiz({ userId, sessionId, answers: [] });
  } catch (err) {
    threw = true;
    assert.strictEqual(err.statusCode, 400);
    assert.ok(/expired/i.test(err.message));
  }
  assert.ok(threw, 'expected submit to throw on expired timer');
  assert.ok(saved, 'expected session to be marked COMPLETED on expiry');
  console.log('timer-expiry self-check passed');
}

async function testCreateQuizLockPreventsConcurrentCreation() {
  const userId = '507f1f77bcf86cd799439013';

  // Simulate the lock already being held by a concurrent request
  User.findOneAndUpdate = async () => null;

  let threw = false;
  try {
    await createQuizEngine.createQuiz({ userId, certificationId: 'cert1', quizType: 'practice' });
  } catch (err) {
    threw = true;
    assert.strictEqual(err.statusCode, 409);
    assert.ok(/already being created/i.test(err.message));
  }
  assert.ok(threw, 'expected createQuiz to reject when lock is already held');
  console.log('quiz-creation-lock self-check passed');
}

async function run() {
  await testTimerExpiryBlocksSubmit();
  await testCreateQuizLockPreventsConcurrentCreation();
}

run();
