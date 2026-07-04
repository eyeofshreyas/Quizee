// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/atomicUpdates.test.js
const assert = require('assert');

const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const UserProgress = require('../models/UserProgress');
const xpEngine = require('../logic/xp/xpEngine');
const leaderboardEngine = require('../logic/leaderboard/leaderboardEngine');
const progressEngine = require('../logic/progress/progressEngine');

async function testXpEngine() {
  let capturedUpdate = null;
  User.findByIdAndUpdate = async (id, update) => {
    capturedUpdate = update;
    return { _id: id, total_points: 115, level: 1, save: async () => {} };
  };

  const result = await xpEngine.awardXP('user1', { correct_answers: 3 });
  assert.ok(capturedUpdate.$inc, 'expected an atomic $inc update, not read-modify-write');
  assert.strictEqual(capturedUpdate.$inc.total_points, 25); // 10 base + 3*5
  assert.strictEqual(result.newTotal, 115);
  assert.strictEqual(result.newLevel, 2); // floor(115/100)+1

  // missing user must throw cleanly, not crash on null.total_points
  User.findByIdAndUpdate = async () => null;
  let threw = false;
  try {
    await xpEngine.awardXP('ghost', { correct_answers: 0 });
  } catch (err) {
    threw = true;
    assert.strictEqual(err.statusCode, 404);
  }
  assert.ok(threw, 'expected awardXP to throw when user does not exist');
  console.log('xpEngine self-check passed');
}

async function testLeaderboardEngine() {
  let capturedUpdate = null;
  let capturedOptions = null;
  Leaderboard.findOneAndUpdate = async (filter, update, opts) => {
    capturedUpdate = update;
    capturedOptions = opts;
    return { user_id: 'user1', points: 50 };
  };

  await leaderboardEngine.updateLeaderboard('user1', { score: 8 });
  assert.ok(capturedUpdate.$inc, 'expected an atomic $inc update');
  assert.strictEqual(capturedUpdate.$inc.points, 8);
  assert.ok(capturedOptions.upsert, 'expected upsert so the first entry of the month still lands atomically');
  console.log('leaderboardEngine self-check passed');
}

async function testProgressEngine() {
  let capturedUpdate = null;
  let capturedOptions = null;
  UserProgress.findOneAndUpdate = async (filter, update, opts) => {
    capturedUpdate = update;
    capturedOptions = opts;
    return { questions_solved: 10, correct_answers: 7, save: async function () {} };
  };

  await progressEngine.updateProgress('user1', 'cert1', {
    total_questions: 5,
    correct_answers: 4,
    results: [{ time_taken: 3 }, { time_taken: 2 }]
  });

  assert.ok(capturedUpdate.$inc, 'expected an atomic $inc update');
  assert.strictEqual(capturedUpdate.$inc.questions_solved, 5);
  assert.strictEqual(capturedUpdate.$inc.correct_answers, 4);
  assert.strictEqual(capturedUpdate.$inc.study_time, 5);
  assert.ok(capturedOptions.upsert, 'expected upsert so the first attempt still lands atomically');
  console.log('progressEngine self-check passed');
}

async function run() {
  await testXpEngine();
  await testLeaderboardEngine();
  await testProgressEngine();
}

run();
