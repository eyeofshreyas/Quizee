// server/logic/quizEngine/navigator.js

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
        // TODO: Update state in cache/DB for the specific question
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
        // TODO: Return the current state array for the frontend navigator palette
        return [];
    }
}

module.exports = new Navigator();
