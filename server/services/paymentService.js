const Payment = require('../models/Payment');

const getPaymentHistory = async ({ userId }) => {
  return Payment.find({ user_id: userId })
    .populate('plan_id', 'name price duration')
    .sort({ createdAt: -1 });
};

module.exports = { getPaymentHistory };