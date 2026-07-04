// server/logic/quizEngine/createQuiz.js
const navigator = require('./navigator');
const timer = require('./timer');
const CertificationModel = require('../../../database/models/Certification');
const QuestionModel = require('../../../database/models/Question');
// TODO: Replace with actual model import once QuizSession persistence is designed
// const QuizSessionModel = require('../../../database/models/QuizSession');

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

        // Step 2: Fetch Certification
        // (Skipping subscription check as requested)
        const certification = await CertificationModel.findById(certificationId);
        if (!certification) {
            throw new Error('Certification not found');
        }

        // Step 3: Generate Questions
        // Build the match query based on available filters
        const matchQuery = { cert_id: certification._id };
        if (domainId) matchQuery.domain_id = domainId;
        if (difficulty) matchQuery.difficulty = difficulty;

        // Fetch random questions based on certification's totalQuestions
        const questions = await QuestionModel.aggregate([
            { $match: matchQuery },
            { $sample: { size: certification.totalQuestions } }
        ]);

        // Step 4: Create Quiz Session
        const sessionId = `session_${Date.now()}`;

        // Initialize question states via navigator module
        const navigationStates = navigator.initializeStates(questions);

        const quizSession = {
            sessionId,
            userId,
            certificationId,
            quizType,
            status: 'CREATED',
            startedTime: new Date(),
            questions: questions.map(q => q._id),
            navigationStates,
            answers: []
        };

        // If it's a mock exam, initialize the timer
        let sessionTimer = null;
        if (quizType === 'mock') {
            sessionTimer = await timer.startTimer(sessionId, certification.durationMinutes);
            quizSession.duration = certification.durationMinutes;
            quizSession.remainingTime = certification.durationMinutes * 60;
        }

        // TODO: Save session to Database or Redis
        // await QuizSessionModel.create(quizSession);

        quizSession.status = 'ACTIVE'; // Transition to active state

        // Step 5: Return Session
        return {
            message: 'Quiz session created successfully',
            quizSession,
            timer: sessionTimer
        };
    }
}

module.exports = new QuizEngine();