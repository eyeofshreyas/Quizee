// server/logic/verify.js
// Run with: node server/logic/verify.js
// End-to-end check of the business logic layer against the real MongoDB.
// Reuses existing seeded data (CLF-C02 cert, testuser/demouser) — no deleteMany, nothing destructive.
require('dotenv').config();
const assert = require('assert');
const { connect, mongoose } = require('../../database/connection');
const Certification = require('../models/Certification');
const Question = require('../models/Question');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const UserProgress = require('../models/UserProgress');
const QuizSession = require('../models/QuizSession');
const createQuiz = require('./quizEngine/createQuiz');
const submitQuiz = require('./quizEngine/submitQuiz');
const navigator = require('./quizEngine/navigator');
const timer = require('./quizEngine/timer');
const subscriptionEngine = require('./subscription/subscriptionEngine');

async function main() {
    await connect();

    const cert = await Certification.findOne({ code: 'CLF-C02' });
    const user = await User.findOne({ username: 'testuser' });
    const demouser = await User.findOne({ username: 'demouser' });
    assert(cert && user && demouser, 'seed data missing: expected CLF-C02 certification, testuser, demouser');

    // testuser is a fixture/dev account — keep it on Pro so this script stays repeatable
    // (Free tier's 1-mock-test cap would otherwise block every run after the first).
    await User.updateOne({ _id: user._id }, { subscription_tier: 'Pro' });

    const someQuestion = await Question.findOne({ cert_id: cert._id });

    // 1. createQuiz — regression check for the difficulty-casing / domain_id ObjectId-casting bugs
    const { quizSession } = await createQuiz.createQuiz({
        userId: user._id.toString(),
        certificationId: cert._id.toString(),
        quizType: 'mock',
        domainId: someQuestion.domain_id.toString(),
        difficulty: 'easy' // deliberately lowercase; schema enum is capitalized
    });
    assert(quizSession.questions.length > 0, 'createQuiz returned 0 questions — difficulty/domain_id bug regressed');
    assert(mongoose.isValidObjectId(quizSession.sessionId), 'sessionId is not a real persisted QuizSession _id');

    // 2. QuizSession persistence — navigator + timer now read/write this doc, not stubs
    const sessionDoc = await QuizSession.findById(quizSession.sessionId);
    assert(sessionDoc && sessionDoc.status === 'ACTIVE', 'QuizSession was not persisted as ACTIVE');

    const paletteBefore = await navigator.getPalette(quizSession.sessionId);
    assert.strictEqual(paletteBefore.length, quizSession.questions.length, 'navigator palette length mismatch');

    const firstQuestionId = quizSession.questions[0];
    await navigator.updateState(quizSession.sessionId, firstQuestionId, 'ANSWERED');
    const paletteAfter = await navigator.getPalette(quizSession.sessionId);
    const updatedEntry = paletteAfter.find(s => s.questionId.toString() === firstQuestionId.toString());
    assert.strictEqual(updatedEntry.state, 'ANSWERED', 'navigator.updateState did not persist');

    const remaining = await timer.getRemainingTime(quizSession.sessionId);
    assert(
        remaining.remainingSeconds > 0 && remaining.remainingSeconds <= cert.durationMinutes * 60,
        'timer.getRemainingTime out of expected range'
    );

    // 3. submitQuiz — Attempt persistence, Pass/Fail, Progress update, QuizSession completion
    const fullQuestions = await Question.find({ _id: { $in: quizSession.questions } });
    const answers = fullQuestions.map(q => ({ question_id: q._id, selected_option: q.correct_index, time_taken: 5 }));

    const result = await submitQuiz.submitQuiz({ userId: user._id.toString(), quizSession, answers });
    assert.strictEqual(result.attempt.correct_answers, fullQuestions.length, 'expected all answers correct');
    assert.strictEqual(result.attempt.passed, true, 'expected passed=true at 100% accuracy');

    const savedAttempt = await Attempt.findById(result.attempt.attempt_id);
    assert(savedAttempt, 'Attempt document was not persisted');
    assert.strictEqual(savedAttempt.answers.length, answers.length, 'persisted Attempt.answers length mismatch');

    const progress = await UserProgress.findOne({ user_id: user._id, cert_id: cert._id });
    assert(progress && progress.questions_solved > 0, 'UserProgress was not updated');

    const completedSession = await QuizSession.findById(quizSession.sessionId);
    assert.strictEqual(completedSession.status, 'COMPLETED', 'QuizSession was not marked COMPLETED on submit');

    // 4. subscriptionEngine — Free tier mock-test cap enforcement (demouser stays Free)
    const existingMockCount = await QuizSession.countDocuments({ user_id: demouser._id, quiz_type: 'mock' });
    const check1 = await subscriptionEngine.canStartQuiz(demouser._id.toString(), 'mock');
    assert.strictEqual(check1.allowed, existingMockCount < 1, 'subscription check mismatch for demouser mock limit');

    if (check1.allowed) {
        // consume the Free-tier mock slot so the very next check proves enforcement kicks in
        await createQuiz.createQuiz({
            userId: demouser._id.toString(),
            certificationId: cert._id.toString(),
            quizType: 'mock'
        });
    }

    const check2 = await subscriptionEngine.canStartQuiz(demouser._id.toString(), 'mock');
    assert.strictEqual(check2.allowed, false, 'expected Free tier mock-test limit to now be enforced for demouser');

    await mongoose.disconnect();
    console.log('OK: all business logic checks passed against the real database.');
}

main().catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
});
