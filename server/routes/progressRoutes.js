const express = require('express');
const { overview, domains } = require('../controllers/progressController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/:certificationId', protect, overview);
router.get('/:certificationId/domains', protect, domains);

module.exports = router;