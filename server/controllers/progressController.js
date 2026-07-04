const { getOverview, getDomainBreakdown } = require('../services/progressService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const overview = async (req, res, next) => {
  try {
    const { certificationId } = req.params;
    const data = await getOverview({ userId: req.user._id, certificationId });
    res.status(200).json(new ApiResponse(200, data, 'Progress overview fetched'));
  } catch (err) {
    next(err);
  }
};

const domains = async (req, res, next) => {
  try {
    const { certificationId } = req.params;
    const data = await getDomainBreakdown({ userId: req.user._id, certificationId });
    res.status(200).json(new ApiResponse(200, data, 'Domain performance fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { overview, domains };