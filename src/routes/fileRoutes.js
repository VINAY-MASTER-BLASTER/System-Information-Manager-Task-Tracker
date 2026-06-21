const express = require('express');
const router = express.Router();
const { validatePath } = require('../middleware/validatePath');
const {
  listFiles,
  readFile,
  createFile,
  updateFile,
  renameFile,
  deleteFile,
} = require('../controllers/fileController');

// List all workspace files
router.get('/', listFiles);

// Create a file or folder
router.post('/', createFile);

// Read a file (wildcard to support nested paths like subdir/file.js)
router.get('/*', validatePath, readFile);

// Update a file's content
router.put('/*', validatePath, updateFile);

// Rename / move a file
router.patch('/*', validatePath, renameFile);

// Delete a file or folder
router.delete('/*', validatePath, deleteFile);

module.exports = router;
