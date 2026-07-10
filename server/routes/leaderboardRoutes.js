const express = require('express');
const { list } = require('../controllers/leaderboardController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', protect, list);

module.exports = router;