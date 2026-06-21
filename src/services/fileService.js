const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const config = require('../config');
const { sanitizeFilename } = require('../utils/helpers');

/**
 * Resolve and validate a file path is within the workspace.
 * Throws if the path escapes the workspace (path traversal prevention).
 */
function safePath(filePath) {
  const resolved = path.resolve(config.WORKSPACE_DIR, filePath);
  if (!resolved.startsWith(config.WORKSPACE_DIR)) {
    const err = new Error('Access denied: path is outside the workspace directory.');
    err.statusCode = 403;
    throw err;
  }
  return resolved;
}

/**
 * Validate file extension
 */
function validateExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext && !config.ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new Error(`File extension "${ext}" is not allowed. Allowed: ${config.ALLOWED_EXTENSIONS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
}

/**
 * List workspace files recursively
 */
async function listFiles(dirRelative = '') {
  const dirPath = safePath(dirRelative);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const items = await Promise.all(
    entries.map(async (entry) => {
      const rel = path.join(dirRelative, entry.name);
      const abs = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const children = await listFiles(rel);
        return {
          name: entry.name,
          path: rel.replace(/\\/g, '/'),
          type: 'folder',
          children,
        };
      }

      const stats = await fs.stat(abs);
      return {
        name: entry.name,
        path: rel.replace(/\\/g, '/'),
        type: 'file',
        size: stats.size,
        modified: stats.mtime.toISOString(),
        extension: path.extname(entry.name),
      };
    })
  );

  return items;
}

/**
 * Read a single file
 */
async function readFile(filePath) {
  const abs = safePath(filePath);
  const stats = await fs.stat(abs);

  if (stats.isDirectory()) {
    const err = new Error('Path is a directory, not a file.');
    err.statusCode = 400;
    throw err;
  }

  const content = await fs.readFile(abs, 'utf-8');
  return {
    name: path.basename(abs),
    path: filePath.replace(/\\/g, '/'),
    content,
    size: stats.size,
    modified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString(),
    extension: path.extname(abs),
  };
}

/**
 * Create a file
 */
async function createFile(filePath, content = '') {
  const sanitized = sanitizeFilename(path.basename(filePath));
  const dir = path.dirname(filePath);
  const fullRelative = dir === '.' ? sanitized : path.join(dir, sanitized);

  validateExtension(sanitized);
  const abs = safePath(fullRelative);

  // Ensure parent directory exists
  await fs.mkdir(path.dirname(abs), { recursive: true });

  // Fail if file already exists
  if (fsSync.existsSync(abs)) {
    const err = new Error(`File "${fullRelative}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  if (Buffer.byteLength(content, 'utf-8') > config.MAX_FILE_SIZE) {
    const err = new Error('File content exceeds maximum allowed size.');
    err.statusCode = 413;
    throw err;
  }

  await fs.writeFile(abs, content, 'utf-8');
  return { name: sanitized, path: fullRelative.replace(/\\/g, '/') };
}

/**
 * Create a folder
 */
async function createFolder(folderPath) {
  const abs = safePath(folderPath);
  await fs.mkdir(abs, { recursive: true });
  return { name: path.basename(abs), path: folderPath.replace(/\\/g, '/') };
}

/**
 * Update (overwrite) a file's content
 */
async function updateFile(filePath, content) {
  const abs = safePath(filePath);

  const stats = await fs.stat(abs);
  if (stats.isDirectory()) {
    const err = new Error('Cannot update a directory.');
    err.statusCode = 400;
    throw err;
  }

  if (Buffer.byteLength(content, 'utf-8') > config.MAX_FILE_SIZE) {
    const err = new Error('File content exceeds maximum allowed size.');
    err.statusCode = 413;
    throw err;
  }

  await fs.writeFile(abs, content, 'utf-8');
  return { name: path.basename(abs), path: filePath.replace(/\\/g, '/') };
}

/**
 * Rename or move a file
 */
async function renameFile(oldPath, newPath) {
  const absOld = safePath(oldPath);
  const absNew = safePath(newPath);

  if (fsSync.existsSync(absNew)) {
    const err = new Error(`Destination "${newPath}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  await fs.mkdir(path.dirname(absNew), { recursive: true });
  await fs.rename(absOld, absNew);
  return { oldPath: oldPath.replace(/\\/g, '/'), newPath: newPath.replace(/\\/g, '/') };
}

/**
 * Delete a file
 */
async function deleteFile(filePath) {
  const abs = safePath(filePath);
  const stats = await fs.stat(abs);

  if (stats.isDirectory()) {
    await fs.rm(abs, { recursive: true, force: true });
  } else {
    await fs.unlink(abs);
  }

  return { path: filePath.replace(/\\/g, '/') };
}

/**
 * Get workspace statistics
 */
async function getWorkspaceStats() {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        totalFolders++;
        await walk(full);
      } else {
        totalFiles++;
        const stats = await fs.stat(full);
        totalSize += stats.size;
      }
    }
  }

  try {
    await walk(config.WORKSPACE_DIR);
  } catch {
    // workspace may not exist yet
  }

  return { totalFiles, totalFolders, totalSize };
}

module.exports = {
  listFiles,
  readFile,
  createFile,
  createFolder,
  updateFile,
  renameFile,
  deleteFile,
  getWorkspaceStats,
  safePath,
};
