const express = require('express');
const { create, submit } = require('../controllers/quizController.js');
const { protect } = require('../middleware/authMiddleware.js');
const validateRequest = require('../middleware/validateRequest.js');
const { createQuizSchema, submitQuizSchema } = require('../validators/quizValidator.js');

const router = express.Router();

router.post('/create', protect, validateRequest(createQuizSchema), create);
router.post('/submit', protect, validateRequest(submitQuizSchema), submit);

module.exports = router;