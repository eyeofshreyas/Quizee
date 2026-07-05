const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    duration: {
      type: Number, // days
      required: true
    },

    features: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "subscription_plans" // seeded data already lives here, not the Mongoose-default "subscriptionplans"
  }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);