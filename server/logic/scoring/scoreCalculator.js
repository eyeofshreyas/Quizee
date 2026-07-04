// server/logic/scoring/scoreCalculator.js
const QuestionModel = require('../../models/Question');

class ScoreCalculator {

    constructor() {}

    /**
     * Calculate score based on user answers and quiz session details
     * @param {Object} quizSession
     * @param {Array} answers
     */
    async calculate(quizSession, answers) {
        let score = 0;
        let correctAnswers = 0;
        let wrongAnswers = 0;
        const detailedResults = [];

        for (const ans of answers) {
            const question = await QuestionModel.findById(ans.question_id);
            const isCorrect = question.correct_index === ans.selected_option;

            if (isCorrect) {
                score += 1;
                correctAnswers += 1;
            } else {
                wrongAnswers += 1;
            }

            detailedResults.push({
                question_id: ans.question_id,
                selected_option: ans.selected_option,
                is_correct: isCorrect,
                time_taken: ans.time_taken
            });
        }

        return {
            score,
            totalQuestions: answers.length, // or quizSession.questions.length
            correctAnswers,
            wrongAnswers,
            detailedResults
        };
    }
}

module.exports = new ScoreCalculator();
