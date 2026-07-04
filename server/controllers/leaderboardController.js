const { getTopUsers } = require('../services/leaderboardService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const list = async (req, res, next) => {
  try {
    const { month, limit } = req.query;
    const data = await getTopUsers({ month, limit: limit ? Number(limit) : undefined });
    res.status(200).json(new ApiResponse(200, data, 'Leaderboard fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { list };