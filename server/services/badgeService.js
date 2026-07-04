const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');

const getUserBadges = async ({ userId }) => {
  const userBadges = await UserBadge.find({ user_id: userId }).sort({ earned_at: -1 });

  const badgeIds = userBadges.map(ub => ub.badge_id);
  const badges = await Badge.find({ _id: { $in: badgeIds } });
  const badgeMap = new Map(badges.map(b => [b._id.toString(), b]));

  return userBadges.map(ub => {
    const badge = badgeMap.get(ub.badge_id.toString());
    return {
      badge_id: ub.badge_id,
      name: badge?.name || 'Unknown Badge',
      description: badge?.description || '',
      icon: badge?.icon || '',
      earned_at: ub.earned_at
    };
  });
};

const getAllBadges = async () => {
  return Badge.find().sort({ createdAt: 1 });
};

module.exports = { getUserBadges, getAllBadges };