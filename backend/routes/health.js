const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/healthController');

router.get('/check', checkHealth);

module.exports = router;
