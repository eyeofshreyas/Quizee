const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    cert_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certification",
      required: true
    },

    domain_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true
    },

    text: {
      type: String,
      required: true
    },

    options: {
      type: [String],
      required: true
    },

    correct_index: {
      type: Number,
      required: true
    },

    explanation: {
      type: String,
      default: ""
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },

    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Question", questionSchema);