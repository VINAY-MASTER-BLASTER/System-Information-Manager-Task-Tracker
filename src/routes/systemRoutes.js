const express = require('express');
const router = express.Router();
const { getAllInfo, getMemoryInfo } = require('../controllers/systemController');

router.get('/', getAllInfo);
router.get('/memory', getMemoryInfo);

module.exports = router;
