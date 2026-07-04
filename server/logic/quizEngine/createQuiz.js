// server/logic/quizEngine/createQuiz.js
const mongoose = require('mongoose');
const navigator = require('./navigator');
const timer = require('./timer');
const subscriptionEngine = require('../subscription/subscriptionEngine');
const CertificationModel = require('../../models/Certification');
const QuestionModel = require('../../models/Question');
const QuizSessionModel = require('../../models/QuizSession');

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
            throw new Error('Missing required fields: userId, certificationId, quizType');
        }

        // Step 2: Check Subscription Limits
        const subscriptionCheck = await subscriptionEngine.canStartQuiz(userId, quizType);
        if (!subscriptionCheck.allowed) {
            throw new Error(subscriptionCheck.reason);
        }

        // Step 3: Fetch Certification
        const certification = await CertificationModel.findById(certificationId);
        if (!certification) {
            throw new Error('Certification not found');
        }

        // Step 4: Generate Questions
        // Build the match query based on available filters
        const matchQuery = { cert_id: certification._id };
        if (domainId) matchQuery.domain_id = new mongoose.Types.ObjectId(domainId);
        if (difficulty) matchQuery.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

        // Fetch random questions based on certification's totalQuestions
        const questions = await QuestionModel.aggregate([
            { $match: matchQuery },
            { $sample: { size: certification.totalQuestions } }
        ]);

        // Step 5: Create and Persist Quiz Session
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

        // Step 6: Return Session
        return {
            message: 'Quiz session created successfully',
            quizSession,
            timer: sessionTimer
        };
    }
}

module.exports = new QuizEngine();