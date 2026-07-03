const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    cert_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certification",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    duration: {
      type: Number,
      required: true
    },

    total_questions: {
      type: Number,
      required: true
    },

    question_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MockTest", mockTestSchema);