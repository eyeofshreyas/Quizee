const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
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

    mocktest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      default: null
    },

    answers: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question"
        },

        selected_option: {
          type: Number
        }
      }
    ],

    score: {
      type: Number,
      default: 0
    },

    correct_answers: {
      type: Number,
      default: 0
    },

    wrong_answers: {
      type: Number,
      default: 0
    },

    accuracy: {
      type: Number,
      default: 0
    },

    time_taken: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Attempt", attemptSchema);