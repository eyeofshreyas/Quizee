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
        const progress = await UserProgressModel.findOne({ user_id: userId, cert_id: certId });
        const timeTaken = attempt.results.reduce((sum, r) => sum + (r.time_taken || 0), 0);

        if (progress) {
            progress.questions_solved += attempt.total_questions;
            progress.correct_answers += attempt.correct_answers;
            progress.accuracy = (progress.correct_answers / progress.questions_solved) * 100;
            progress.study_time += timeTaken;
            progress.last_activity = new Date();
            await progress.save();
        } else {
            await UserProgressModel.create({
                user_id: userId,
                cert_id: certId,
                questions_solved: attempt.total_questions,
                correct_answers: attempt.correct_answers,
                accuracy: attempt.total_questions > 0 ? (attempt.correct_answers / attempt.total_questions) * 100 : 0,
                study_time: timeTaken,
                last_activity: new Date()
            });
        }

        return true;
    }
}

module.exports = new ProgressEngine();
