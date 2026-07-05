const { getAllPlans, subscribeToPlan } = require('../services/subscriptionService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const plans = async (req, res, next) => {
  try {
    const data = await getAllPlans();
    res.status(200).json(new ApiResponse(200, data, 'Subscription plans fetched'));
  } catch (err) {
    next(err);
  }
};

const subscribe = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const data = await subscribeToPlan({ userId: req.user._id, planId });
    res.status(200).json(new ApiResponse(200, data, 'Subscribed successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = { plans, subscribe };