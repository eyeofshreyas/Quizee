const { getPaymentHistory } = require('../services/paymentService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const history = async (req, res, next) => {
  try {
    const data = await getPaymentHistory({ userId: req.user._id });
    res.status(200).json(new ApiResponse(200, data, 'Payment history fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { history };