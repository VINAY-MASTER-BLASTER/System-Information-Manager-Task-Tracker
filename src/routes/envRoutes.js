const express = require('express');
const router = express.Router();
const { getEnvVars } = require('../controllers/envController');

router.get('/', getEnvVars);

module.exports = router;
