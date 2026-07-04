// server/logic/recommendation/recommendationEngine.js
const QuestionModel = require('../../models/Question');

class RecommendationEngine {

    constructor() {}

    /**
     * Generate recommendations based on the user's quiz performance
     * @param {String} userId 
     * @param {Object} attempt 
     */
    async generateRecommendations(userId, attempt) {
        const recommendations = [];

        // Simple logic: recommend studying the domain of questions that were answered incorrectly
        // Real implementation might use AI or deeper heuristics

        const missedDomains = new Set();
        
        for (const result of attempt.results) {
            if (!result.is_correct) {
                const question = await QuestionModel.findById(result.question_id);
                if (question) missedDomains.add(question.domain_id.toString());
            }
        }

        if (missedDomains.size > 0) {
            recommendations.push({
                type: 'REVIEW_DOMAIN',
                message: 'Review specific domains to improve your score.',
                data: Array.from(missedDomains)
            });
        }

        const scorePercent = attempt.total_questions > 0
            ? (attempt.correct_answers / attempt.total_questions) * 100
            : 0;

        if (scorePercent < 70) {
            recommendations.push({
                type: 'PRACTICE_QUIZ',
                message: 'Consider taking more practice quizzes before attempting another mock exam.'
            });
        }

        return recommendations;
    }
}

module.exports = new RecommendationEngine();
