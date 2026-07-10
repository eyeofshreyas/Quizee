// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/scoreCalculator.test.js
const assert = require('assert');
const QuestionModel = require('../models/Question');
const scoreCalculator = require('../logic/scoring/scoreCalculator');

const assignedId = '507f1f77bcf86cd799439011';
const outsideId = '507f1f77bcf86cd799439099'; // not part of the session

const questions = {
  [assignedId]: { correct_index: 2, explanation: 'Because AWS Shield handles DDoS.' },
  [outsideId]: { correct_index: 0, explanation: 'n/a' }
};

QuestionModel.findById = async (id) => questions[id.toString()] || null;

async function run() {
  const quizSession = { questions: [assignedId] };

  const correct = await scoreCalculator.calculate(quizSession, [
    { question_id: assignedId, selected_option: 2 }
  ]);
  assert.strictEqual(correct.correctAnswers, 1);
  assert.strictEqual(correct.totalQuestions, 1);

  // answer referencing a question outside this session must be ignored, not scored
  const spoofed = await scoreCalculator.calculate(quizSession, [
    { question_id: outsideId, selected_option: 0 }
  ]);
  assert.strictEqual(spoofed.correctAnswers, 0);
  assert.strictEqual(spoofed.wrongAnswers, 0);
  assert.strictEqual(spoofed.totalQuestions, 1); // derived from session, not answers.length

  // totalQuestions reflects the full session even if fewer answers are submitted
  const partial = await scoreCalculator.calculate(
    { questions: [assignedId, outsideId] },
    []
  );
  assert.strictEqual(partial.totalQuestions, 2);

  // detailedResults must carry the answer key so the client can show it post-submit
  const detailed = await scoreCalculator.calculate(quizSession, [
    { question_id: assignedId, selected_option: 0 }
  ]);
  assert.strictEqual(detailed.detailedResults[0].correct_index, 2);
  assert.strictEqual(detailed.detailedResults[0].explanation, 'Because AWS Shield handles DDoS.');
  assert.strictEqual(detailed.detailedResults[0].is_correct, false);

  console.log('scoreCalculator self-check passed');
}

run();
