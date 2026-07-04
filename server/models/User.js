const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    profileImage: {
      type: String,
      default: ""
    },

    subscription_tier: {
      type: String,
      default: "Free"
    },

    subscription_start: {
      type: Date,
      default: null
    },

    expiry_date: {
      type: Date,
      default: null
    },

    total_points: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    },

    streak_days: {
      type: Number,
      default: 0
    },

    lastLogin: {
      type: Date,
      default: null
    },

    quiz_creation_lock: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);