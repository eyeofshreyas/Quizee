const mongoose = require("mongoose");

const userBadgeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    badge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true
    },

    earned_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("UserBadge", userBadgeSchema);