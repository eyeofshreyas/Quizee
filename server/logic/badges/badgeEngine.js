// server/logic/badges/badgeEngine.js
const BadgeModel = require('../../../database/models/Badge');
const UserBadgeModel = require('../../../database/models/UserBadge');

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
            const badge = await BadgeModel.findOne({ name: 'Perfect Score' });

            if (badge) {
                const hasBadge = await UserBadgeModel.exists({ user_id: userId, badge_id: badge._id });

                if (!hasBadge) {
                    await UserBadgeModel.create({
                        user_id: userId,
                        badge_id: badge._id,
                        earned_at: new Date()
                    });
                    newlyEarnedBadges.push(badge);
                }
            }
            // no seeded "Perfect Score" Badge doc yet — silently no-ops until one exists,
            // rather than throwing or inventing a fallback badge
        }

        // Example condition: First Mock Exam
        // Note: Attempt schema has no exam_type field, so "first" can't be determined
        // by counting Attempt docs — UserBadge itself is the source of truth for
        // "already awarded", same guard pattern as Perfect Score above.
        if (attempt.exam_type === 'mock') {
            const badge = await BadgeModel.findOne({ name: 'First Mock Exam' });

            if (badge) {
                const hasBadge = await UserBadgeModel.exists({ user_id: userId, badge_id: badge._id });

                if (!hasBadge) {
                    await UserBadgeModel.create({
                        user_id: userId,
                        badge_id: badge._id,
                        earned_at: new Date()
                    });
                    newlyEarnedBadges.push(badge);
                }
            }
        }

        return newlyEarnedBadges;
    }
}

module.exports = new BadgeEngine();
