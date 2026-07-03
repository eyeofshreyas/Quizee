const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    points: {
      type: Number,
      default: 0
    },

    rank: {
      type: Number,
      default: 0
    },

    month: {
      type: String, // e.g. "2026-07"
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);