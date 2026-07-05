const express = require('express');
const { history } = require('../controllers/paymentController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/history', protect, history);

module.exports = router;