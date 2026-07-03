const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
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

    questions_solved: {
      type: Number,
      default: 0
    },

    correct_answers: {
      type: Number,
      default: 0
    },

    accuracy: {
      type: Number,
      default: 0
    },

    study_time: {
      type: Number,
      default: 0
    },

    last_activity: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);