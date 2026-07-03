const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    icon: {
      type: String,
      default: ""
    },

    passingScore: {
      type: Number,
      required: true
    },

    durationMinutes: {
      type: Number,
      required: true
    },

    totalQuestions: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Certification", certificationSchema);