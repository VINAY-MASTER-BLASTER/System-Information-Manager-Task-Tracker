const systemService = require('../services/systemService');

async function getAllInfo(req, res, next) {
  try {
    const info = systemService.getAllSystemInfo();
    res.json({ success: true, data: info });
  } catch (err) {
    next(err);
  }
}

async function getMemoryInfo(req, res, next) {
  try {
    const memory = systemService.getMemoryInfo();
    res.json({ success: true, data: memory });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllInfo, getMemoryInfo };
