const { getUserBadges, getAllBadges } = require('../services/badgeService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const myBadges = async (req, res, next) => {
  try {
    const data = await getUserBadges({ userId: req.user._id });
    res.status(200).json(new ApiResponse(200, data, 'Your badges fetched'));
  } catch (err) {
    next(err);
  }
};

const allBadges = async (req, res, next) => {
  try {
    const data = await getAllBadges();
    res.status(200).json(new ApiResponse(200, data, 'All badges fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { myBadges, allBadges };