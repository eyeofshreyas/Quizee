const express = require('express');
const { myBadges, allBadges } = require('../controllers/badgeController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/me', protect, myBadges);
router.get('/', allBadges);

module.exports = router;