const envService = require('../services/envService');

async function getEnvVars(req, res, next) {
  try {
    const query = req.query.search || '';
    const vars = envService.searchEnvVars(query);
    res.json({ success: true, data: vars });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEnvVars };
