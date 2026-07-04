// server/logic/subscription/subscriptionEngine.js
// Limits mirror the seeded SubscriptionPlan feature lists:
// Free: "50 Practice Questions", "1 Mock Test" | Pro/Enterprise: unlimited.
const UserModel = require('../../models/User');
const QuizSessionModel = require('../../models/QuizSession');

const TIER_LIMITS = {
    Free: { maxPracticeQuestions: 50, maxMockTests: 1 },
    Pro: { maxPracticeQuestions: Infinity, maxMockTests: Infinity },
    Enterprise: { maxPracticeQuestions: Infinity, maxMockTests: Infinity }
};

class SubscriptionEngine {

    constructor() {}

    /**
     * Check whether a user is allowed to start another quiz of the given type.
     * @param {String} userId
     * @param {String} quizType ('practice' | 'mock')
     */
    async canStartQuiz(userId, quizType) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error('User not found');

        const limits = TIER_LIMITS[user.subscription_tier] || TIER_LIMITS.Free;

        if (quizType === 'mock') {
            const mockCount = await QuizSessionModel.countDocuments({ user_id: userId, quiz_type: 'mock' });
            if (mockCount >= limits.maxMockTests) {
                return { allowed: false, reason: `${user.subscription_tier} tier limit reached: ${limits.maxMockTests} mock test(s)` };
            }
        }

        if (quizType === 'practice') {
            const practiceSessions = await QuizSessionModel.find({ user_id: userId, quiz_type: 'practice' }).select('questions');
            const questionsUsed = practiceSessions.reduce((sum, s) => sum + s.questions.length, 0);
            if (questionsUsed >= limits.maxPracticeQuestions) {
                return { allowed: false, reason: `${user.subscription_tier} tier limit reached: ${limits.maxPracticeQuestions} practice questions` };
            }
        }

        return { allowed: true };
    }
}

module.exports = new SubscriptionEngine();
