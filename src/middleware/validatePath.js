const path = require('path');
const config = require('../config');

/**
 * Middleware that validates the :name param resolves inside the workspace.
 */
function validatePath(req, _res, next) {
  try {
    const filePath = req.params.name || req.params[0] || '';
    const resolved = path.resolve(config.WORKSPACE_DIR, filePath);

    if (!resolved.startsWith(config.WORKSPACE_DIR)) {
      const err = new Error('Access denied: path traversal detected.');
      err.statusCode = 403;
      return next(err);
    }

    req.resolvedPath = resolved;
    req.relativePath = filePath;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { validatePath };
