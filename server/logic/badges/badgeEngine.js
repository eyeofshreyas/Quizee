// server/logic/badges/badgeEngine.js

class BadgeEngine {

    constructor() {}

    /**
     * Evaluate if the user has earned any new badges based on their attempt
     * @param {String} userId 
     * @param {Object} attempt 
     */
    async evaluateBadges(userId, attempt) {
        const newlyEarnedBadges = [];

        // Example condition: Perfect Score Badge
        if (attempt.correct_answers === attempt.total_questions && attempt.total_questions > 0) {
            // TODO: Check if user already has "Perfect Score" badge
            // If not, award it
            /*
            const badge = await BadgeModel.findOne({ name: 'Perfect Score' });
            const hasBadge = await UserBadgeModel.exists({ user_id: userId, badge_id: badge._id });
            
            if (!hasBadge) {
                await UserBadgeModel.create({
                    user_id: userId,
                    badge_id: badge._id,
                    earnedAt: new Date()
                });
                newlyEarnedBadges.push(badge);
            }
            */
        }

        // Example condition: First Mock Exam
        // ...

        return newlyEarnedBadges;
    }
}

module.exports = new BadgeEngine();
