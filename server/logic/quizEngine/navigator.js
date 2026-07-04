// server/logic/quizEngine/navigator.js
const QuizSessionModel = require('../../../database/models/QuizSession');

class Navigator {

    constructor() {}

    /**
     * Initialize question states for a new quiz
     * @param {Array} questions 
     */
    initializeStates(questions) {
        return questions.map((q, index) => ({
            questionId: q._id,
            state: index === 0 ? 'CURRENT' : 'UNVISITED',
            timeSpent: 0
        }));
    }

    /**
     * Update the state of a question
     * @param {String} sessionId
     * @param {String} questionId
     * @param {String} newState (UNVISITED, CURRENT, ANSWERED, MARKED_FOR_REVIEW, ANSWERED_AND_REVIEW)
     */
    async updateState(sessionId, questionId, newState) {
        const session = await QuizSessionModel.findById(sessionId);
        if (!session) throw new Error('Quiz session not found');

        const entry = session.navigation_states.find(s => s.question_id.toString() === questionId.toString());
        if (!entry) throw new Error('Question not part of this quiz session');

        entry.state = newState;
        await session.save();

        return {
            questionId,
            state: newState
        };
    }

    /**
     * Get the current state of all questions in the quiz
     * @param {String} sessionId
     */
    async getPalette(sessionId) {
        const session = await QuizSessionModel.findById(sessionId);
        if (!session) throw new Error('Quiz session not found');

        return session.navigation_states.map(s => ({
            questionId: s.question_id,
            state: s.state,
            timeSpent: s.time_spent
        }));
    }
}

module.exports = new Navigator();
