// server/logic/subscription/subscriptionEngine.js
// Limits mirror the seeded SubscriptionPlan feature lists:
// Free: "50 Practice Questions", "1 Mock Test" | Pro/Enterprise: unlimited.
const UserModel = require('../../models/User');
const QuizSessionModel = require('../../models/QuizSession');
const SubscriptionPlanModel = require('../../models/SubscriptionPlan');
const PaymentModel = require('../../models/Payment');

const TIER_LIMITS = {
    Free: { maxPracticeQuestions: 50, maxMockTests: 1 },
    Pro: { maxPracticeQuestions: Infinity, maxMockTests: Infinity },
    Enterprise: { maxPracticeQuestions: Infinity, maxMockTests: Infinity }
};

class SubscriptionEngine {

    constructor() {}

    // ponytail: expiry isn't written back to User.subscription_tier here, it only affects what
    // canStartQuiz / effective-tier callers see. A real downgrade write (cron or on next login)
    // would be the upgrade path if something needs the persisted field to be accurate too.
    _effectiveTier(user) {
        const expired = user.subscription_tier !== 'Free'
            && user.expiry_date
            && user.expiry_date < new Date();
        return expired ? 'Free' : user.subscription_tier;
    }

    /**
     * Check whether a user is allowed to start another quiz of the given type.
     * @param {String} userId
     * @param {String} quizType ('practice' | 'mock')
     */
    async canStartQuiz(userId, quizType) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error('User not found');

        const tier = this._effectiveTier(user);
        const limits = TIER_LIMITS[tier] || TIER_LIMITS.Free;

        if (quizType === 'mock') {
            const mockCount = await QuizSessionModel.countDocuments({ user_id: userId, quiz_type: 'mock' });
            if (mockCount >= limits.maxMockTests) {
                return { allowed: false, reason: `${tier} tier limit reached: ${limits.maxMockTests} mock test(s)` };
            }
        }

        if (quizType === 'practice') {
            const practiceSessions = await QuizSessionModel.find({ user_id: userId, quiz_type: 'practice' }).select('questions');
            const questionsUsed = practiceSessions.reduce((sum, s) => sum + s.questions.length, 0);
            if (questionsUsed >= limits.maxPracticeQuestions) {
                return { allowed: false, reason: `${tier} tier limit reached: ${limits.maxPracticeQuestions} practice questions` };
            }
        }

        return { allowed: true };
    }

    /**
     * Mock subscription purchase — no real payment gateway wired up, the payment is recorded
     * as immediately successful. Upgrades the user's tier and sets a fresh expiry from now.
     * @param {String} userId
     * @param {String} planId
     */
    async subscribe(userId, planId) {
        const plan = await SubscriptionPlanModel.findById(planId);
        if (!plan) throw new Error('Subscription plan not found');

        const now = new Date();
        const expiry = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

        const payment = await PaymentModel.create({
            user_id: userId,
            plan_id: plan._id,
            amount: plan.price,
            payment_status: 'success', // ponytail: mocked gateway, always succeeds
            transaction_id: `MOCK-${now.getTime()}`,
            paid_at: now
        });

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { subscription_tier: plan.name, subscription_start: now, expiry_date: expiry } },
            { returnDocument: 'after' }
        );
        if (!user) throw new Error('User not found');

        return {
            subscription_tier: user.subscription_tier,
            subscription_start: user.subscription_start,
            expiry_date: user.expiry_date,
            payment_id: payment._id
        };
    }
}

module.exports = new SubscriptionEngine();
