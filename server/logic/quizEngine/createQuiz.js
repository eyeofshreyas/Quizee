// server/logic/quizEngine/createQuiz.js
const mongoose = require('mongoose');
const navigator = require('./navigator');
const timer = require('./timer');
const subscriptionEngine = require('../subscription/subscriptionEngine');
const CertificationModel = require('../../models/Certification');
const QuestionModel = require('../../models/Question');
const QuizSessionModel = require('../../models/QuizSession');
const UserModel = require('../../models/User');
const ApiError = require('../../utils/ApiError');

class QuizEngine {

    constructor() { }

    /**
     * Create a new quiz session
     *
     * @param {Object} payload
     * @param {String} payload.userId
     * @param {String} payload.certificationId
     * @param {String} payload.quizType
     * @param {String} payload.domainId
     * @param {String} payload.difficulty
     */
    async createQuiz(payload) {
        const {
            userId,
            certificationId,
            quizType,
            domainId,
            difficulty
        } = payload;

        // Step 1: Validate Inputs
        if (!userId || !certificationId || !quizType) {
            throw new ApiError(400, 'Missing required fields: userId, certificationId, quizType');
        }

        // Step 2: Acquire a per-user lock so two concurrent requests can't both
        // pass the subscription check below before either session is created.
        // ponytail: global-per-user lock, move to a proper semaphore/queue if this becomes a bottleneck
        const lockedUser = await UserModel.findOneAndUpdate(
            { _id: userId, quiz_creation_lock: { $ne: true } },
            { $set: { quiz_creation_lock: true } }
        );
        if (!lockedUser) {
            throw new ApiError(409, 'Another quiz is already being created for this account, please retry');
        }

        try {
            // Step 3: Check Subscription Limits
            const subscriptionCheck = await subscriptionEngine.canStartQuiz(userId, quizType);
            if (!subscriptionCheck.allowed) {
                throw new ApiError(403, subscriptionCheck.reason);
            }

            // Step 4: Fetch Certification
            const certification = await CertificationModel.findById(certificationId);
            if (!certification) {
                throw new ApiError(404, 'Certification not found');
            }

            // Step 5: Generate Questions
            // Build the match query based on available filters
            const matchQuery = { cert_id: certification._id };
            if (domainId) matchQuery.domain_id = new mongoose.Types.ObjectId(domainId);
            if (difficulty) matchQuery.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

            // Fetch random questions based on certification's totalQuestions
            const questions = await QuestionModel.aggregate([
                { $match: matchQuery },
                { $sample: { size: certification.totalQuestions } }
            ]);

            // Step 6: Create and Persist Quiz Session
            // Initialize question states via navigator module
            const navigationStates = navigator.initializeStates(questions);

            const sessionDoc = await QuizSessionModel.create({
                user_id: userId,
                cert_id: certification._id,
                quiz_type: quizType,
                status: 'ACTIVE',
                questions: questions.map(q => q._id),
                navigation_states: navigationStates.map(s => ({
                    question_id: s.questionId,
                    state: s.state,
                    time_spent: s.timeSpent
                }))
            });

            const quizSession = {
                sessionId: sessionDoc._id,
                userId,
                certificationId,
                quizType,
                status: 'ACTIVE',
                startedTime: sessionDoc.createdAt,
                questions: questions.map(q => q._id),
                navigationStates,
                answers: []
            };

            // If it's a mock exam, initialize the timer
            let sessionTimer = null;
            if (quizType === 'mock') {
                sessionTimer = await timer.startTimer(sessionDoc._id, certification.durationMinutes);
                quizSession.duration = certification.durationMinutes;
                quizSession.remainingTime = certification.durationMinutes * 60;
            }

            // Step 7: Return Session
            return {
                message: 'Quiz session created successfully',
                quizSession,
                timer: sessionTimer
            };
        } finally {
            await UserModel.findByIdAndUpdate(userId, { $set: { quiz_creation_lock: false } });
        }
    }
}

module.exports = new QuizEngine();