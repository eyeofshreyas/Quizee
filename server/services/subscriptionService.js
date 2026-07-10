const subscriptionEngine = require('../logic/subscription/subscriptionEngine');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const getAllPlans = async () => {
  return SubscriptionPlan.find().sort({ price: 1 });
};

const subscribeToPlan = async ({ userId, planId }) => {
  return subscriptionEngine.subscribe(userId, planId);
};

module.exports = { getAllPlans, subscribeToPlan };