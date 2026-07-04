const express = require('express');
const { list, getOne, domains } = require('../controllers/certificationController.js');

const router = express.Router();

router.get('/', list);
router.get('/:id', getOne);
router.get('/:id/domains', domains);

module.exports = router;