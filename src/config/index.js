const path = require('path');

module.exports = {
  // Server
  // PORT: process.env.PORT || 3000,
  PORT: "https://system-information-manager-task-tracker.onrender.com" || 3000,

  // Workspace — the only directory files can be created/read/updated/deleted in
  WORKSPACE_DIR: path.resolve(__dirname, '..', '..', 'workspace'),

  // Allowed file extensions for CRUD
  ALLOWED_EXTENSIONS: ['.js', '.ts', '.json', '.txt', '.md', '.html', '.css', '.xml', '.yaml', '.yml'],

  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // requests per window
  },

  // Max file size (1 MB)
  MAX_FILE_SIZE: 1 * 1024 * 1024,
};
