// server/logic/xp/xpEngine.js
const UserModel = require('../../models/User');
const ApiError = require('../../utils/ApiError');

class XPEngine {

    constructor() {}

    /**
     * Calculate and award XP to a user based on quiz performance
     * @param {String} userId 
     * @param {Object} attempt 
     */
    async awardXP(userId, attempt) {
        let xpGained = 0;

        // Base XP for completion
        xpGained += 10;

        // Bonus for correct answers
        xpGained += (attempt.correct_answers * 5);

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $inc: { total_points: xpGained } },
            { returnDocument: 'after' }
        );
        if (!user) throw new ApiError(404, 'User not found');

        // Simple level logic: 1 level per 100 XP
        const newLevel = Math.floor(user.total_points / 100) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            await user.save();
        }

        return {
            xpGained,
            newTotal: user.total_points,
            newLevel: user.level
        };
    }
}

module.exports = new XPEngine();
