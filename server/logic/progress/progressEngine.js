// server/logic/progress/progressEngine.js
const UserProgressModel = require('../../models/UserProgress');

class ProgressEngine {

    constructor() {}

    /**
     * Update user progress based on quiz attempt
     * @param {String} userId
     * @param {String} certId
     * @param {Object} attempt
     */
    async updateProgress(userId, certId, attempt) {
        const timeTaken = attempt.results.reduce((sum, r) => sum + (r.time_taken || 0), 0);

        const progress = await UserProgressModel.findOneAndUpdate(
            { user_id: userId, cert_id: certId },
            {
                $inc: {
                    questions_solved: attempt.total_questions,
                    correct_answers: attempt.correct_answers,
                    study_time: timeTaken
                },
                $set: { last_activity: new Date() }
            },
            { upsert: true, returnDocument: 'after' }
        );

        // accuracy is derived from the now-authoritative counters above;
        // recomputing it here (rather than via $inc) keeps it correct even
        // if this write raced with another one for the same user/cert
        progress.accuracy = progress.questions_solved > 0
            ? (progress.correct_answers / progress.questions_solved) * 100
            : 0;
        await progress.save();

        return true;
    }
}

module.exports = new ProgressEngine();
