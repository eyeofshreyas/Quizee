// server/logic/quizEngine/timer.js
const QuizSessionModel = require('../../models/QuizSession');

class Timer {

    constructor() {}

    /**
     * Start the timer for a quiz session
     * @param {String} sessionId
     * @param {Number} durationMinutes
     */
    async startTimer(sessionId, durationMinutes) {
        const startTime = new Date();
        await QuizSessionModel.findByIdAndUpdate(sessionId, {
            duration_minutes: durationMinutes,
            timer_started_at: startTime
        });

        return {
            sessionId,
            startTime,
            durationMinutes,
            status: 'ACTIVE'
        };
    }

    /**
     * Get the remaining time for a quiz session
     * @param {String} sessionId
     */
    async getRemainingTime(sessionId) {
        const session = await QuizSessionModel.findById(sessionId);
        if (!session || !session.timer_started_at) {
            return { sessionId, remainingSeconds: null };
        }

        const elapsedSeconds = (Date.now() - session.timer_started_at.getTime()) / 1000;
        const remainingSeconds = Math.max(0, session.duration_minutes * 60 - elapsedSeconds);

        return { sessionId, remainingSeconds: Math.round(remainingSeconds) };
    }

    /**
     * Force submit if the timer has expired
     * @param {String} sessionId
     */
    async checkExpiration(sessionId) {
        const { remainingSeconds } = await this.getRemainingTime(sessionId);
        return remainingSeconds !== null && remainingSeconds <= 0;
    }
}

module.exports = new Timer();
