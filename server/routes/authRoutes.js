const express = require('express');
const { register, login, getMe, updateMe } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');
const validateRequest = require('../middleware/validateRequest.js');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/authValidator.js');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);
router.patch('/me', protect, validateRequest(updateProfileSchema), updateMe);

module.exports = router;
