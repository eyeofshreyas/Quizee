// server/logic/quizEngine/submitQuiz.js
const AttemptModel = require('../../models/Attempt');
const CertificationModel = require('../../models/Certification');
const QuizSessionModel = require('../../models/QuizSession');
const scoreCalculator = require('../scoring/scoreCalculator');
const progressEngine = require('../progress/progressEngine');
const xpEngine = require('../xp/xpEngine');
const badgeEngine = require('../badges/badgeEngine');
const leaderboardEngine = require('../leaderboard/leaderboardEngine');
const recommendationEngine = require('../recommendation/recommendationEngine');

class SubmitQuizEngine {

    constructor() {}

    /**
     * Submit a quiz and process all related logic
     *
     * @param {Object} payload 
     * @param {String} payload.userId
     * @param {Object} payload.quizSession
     * @param {Array} payload.answers 
     */
    async submitQuiz(payload) {
        const { userId, quizSession, answers } = payload;
        
        // 1. Calculate Score
        const scoreResult = await scoreCalculator.calculate(quizSession, answers);
        
        // 2. Generate Result & Store Attempt
        const attempt = {
            user_id: userId,
            timestamp: new Date(),
            score: scoreResult.score,
            exam_type: quizSession.quizType,
            results: scoreResult.detailedResults,
            total_questions: scoreResult.totalQuestions,
            correct_answers: scoreResult.correctAnswers,
            wrong_answers: scoreResult.wrongAnswers
        };

        const totalTimeTaken = scoreResult.detailedResults.reduce((sum, r) => sum + (r.time_taken || 0), 0);
        const accuracy = scoreResult.totalQuestions > 0
            ? (scoreResult.correctAnswers / scoreResult.totalQuestions) * 100
            : 0;

        // Pass/Fail: percentage-based against Certification.passingScore
        const certification = await CertificationModel.findById(quizSession.certificationId);
        attempt.passed = certification ? accuracy >= certification.passingScore : null;

        const savedAttempt = await AttemptModel.create({
            user_id: userId,
            cert_id: quizSession.certificationId,
            mocktest_id: quizSession.mocktestId || null,
            answers: scoreResult.detailedResults.map(r => ({
                question_id: r.question_id,
                selected_option: r.selected_option
            })),
            score: scoreResult.score,
            correct_answers: scoreResult.correctAnswers,
            wrong_answers: scoreResult.wrongAnswers,
            accuracy,
            time_taken: totalTimeTaken
        });

        attempt.attempt_id = savedAttempt._id;

        if (quizSession.sessionId) {
            await QuizSessionModel.findByIdAndUpdate(quizSession.sessionId, { status: 'COMPLETED' });
        }

        // 3. Update Progress
        if (quizSession.quizType === 'practice' || quizSession.quizType === 'mock') {
             await progressEngine.updateProgress(userId, quizSession.certificationId, attempt);
        }

        // 4. Award XP
        await xpEngine.awardXP(userId, attempt);

        // 5. Check Badges
        await badgeEngine.evaluateBadges(userId, attempt);

        // 6. Update Leaderboard (Mock Exam only)
        if (quizSession.quizType === 'mock') {
            await leaderboardEngine.updateLeaderboard(userId, attempt);
        }

        // 7. Generate Recommendations
        const recommendations = await recommendationEngine.generateRecommendations(userId, attempt);

        return {
            attempt,
            recommendations,
            status: 'COMPLETED'
        };
    }
}

module.exports = new SubmitQuizEngine();
