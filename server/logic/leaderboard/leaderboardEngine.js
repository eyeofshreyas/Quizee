// server/logic/leaderboard/leaderboardEngine.js
const LeaderboardModel = require('../../../database/models/Leaderboard');

class LeaderboardEngine {

    constructor() {}

    /**
     * Update the user's leaderboard ranking and points
     * @param {String} userId
     * @param {Object} attempt
     */
    async updateLeaderboard(userId, attempt) {
        // Mock Exams contribute to Leaderboard, Practice do not (handled in submitQuiz caller)

        const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
        const pointsEarned = attempt.score;

        const leaderboardEntry = await LeaderboardModel.findOne({ user_id: userId, month: currentMonth });

        if (leaderboardEntry) {
            leaderboardEntry.points += pointsEarned;
            await leaderboardEntry.save();
        } else {
            await LeaderboardModel.create({
                user_id: userId,
                points: pointsEarned,
                rank: 0, // ponytail: rank left at 0, real-time/cron recompute is a follow-up
                month: currentMonth
            });
        }

        return true;
    }

    /**
     * Get top users for a specific month
     * @param {String} month
     * @param {Number} limit
     */
    async getTopUsers(month, limit = 10) {
        return LeaderboardModel.find({ month }).sort({ points: -1 }).limit(limit);
    }
}

module.exports = new LeaderboardEngine();
