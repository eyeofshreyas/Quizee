// server/logic/quizEngine/submitQuiz.js

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
        // TODO: Store attempt in DB

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
