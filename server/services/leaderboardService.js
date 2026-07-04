const leaderboardEngine = require('../logic/leaderboard/leaderboardEngine');
const User = require('../models/User');

const getTopUsers = async ({ month, limit }) => {
  const currentMonth = month || new Date().toISOString().slice(0, 7); // e.g. "2026-07"

  const entries = await leaderboardEngine.getTopUsers(currentMonth, limit || 10);

  // Enrich with usernames since Leaderboard only stores user_id
  const userIds = entries.map(e => e.user_id);
  const users = await User.find({ _id: { $in: userIds } }).select('username profileImage');
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  return entries.map((entry, index) => ({
    rank: index + 1,
    user_id: entry.user_id,
    username: userMap.get(entry.user_id.toString())?.username || 'Unknown',
    profileImage: userMap.get(entry.user_id.toString())?.profileImage || '',
    points: entry.points,
    month: entry.month
  }));
};

module.exports = { getTopUsers };