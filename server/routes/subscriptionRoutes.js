const express = require('express');
const { plans, subscribe } = require('../controllers/subscriptionController.js');
const { protect } = require('../middleware/authMiddleware.js');
const validateRequest = require('../middleware/validateRequest.js');
const { subscribeSchema } = require('../validators/paymentValidator.js');

const router = express.Router();

router.get('/plans', plans);
router.post('/subscribe', protect, validateRequest(subscribeSchema), subscribe);

module.exports = router;