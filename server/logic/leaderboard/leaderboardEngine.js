// server/logic/leaderboard/leaderboardEngine.js

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

        // TODO: Update Leaderboard points
        /*
        const leaderboardEntry = await LeaderboardModel.findOne({ user_id: userId, month: currentMonth });
        
        if (leaderboardEntry) {
            leaderboardEntry.points += pointsEarned;
            await leaderboardEntry.save();
        } else {
            await LeaderboardModel.create({
                user_id: userId,
                points: pointsEarned,
                rank: 0, // Need to implement cron job or real-time rank calculation
                month: currentMonth
            });
        }
        */

        return true;
    }

    /**
     * Get top users for a specific month
     * @param {String} month 
     * @param {Number} limit 
     */
    async getTopUsers(month, limit = 10) {
        // TODO: Query leaderboard sorted by points desc
        return [];
    }
}

module.exports = new LeaderboardEngine();
