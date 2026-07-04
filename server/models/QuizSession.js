// database/models/QuizSession.js
// New model, authored on the "logic" branch to back Timer/Navigation persistence
// (not pulled from origin/main — doesn't exist there yet). Pending Aishwarya's
// schema-design sign-off before merging, per the team's folder-ownership split.
const mongoose = require("mongoose");

const quizSessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        cert_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certification",
            required: true
        },

        quiz_type: {
            type: String,
            enum: ["practice", "mock"],
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "COMPLETED"],
            default: "ACTIVE"
        },

        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],

        navigation_states: [
            {
                question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
                state: {
                    type: String,
                    enum: ["UNVISITED", "CURRENT", "ANSWERED", "MARKED_FOR_REVIEW", "ANSWERED_AND_REVIEW"],
                    default: "UNVISITED"
                },
                time_spent: { type: Number, default: 0 }
            }
        ],

        duration_minutes: {
            type: Number,
            default: null
        },

        timer_started_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("QuizSession", quizSessionSchema);
