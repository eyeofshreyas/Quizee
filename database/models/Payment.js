const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    payment_status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    transaction_id: {
      type: String,
      default: ""
    },

    paid_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);