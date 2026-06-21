const fileService = require('../services/fileService');

async function listFiles(req, res, next) {
  try {
    const dir = req.query.dir || '';
    const files = await fileService.listFiles(dir);
    const stats = await fileService.getWorkspaceStats();
    res.json({ success: true, data: { files, stats } });
  } catch (err) {
    next(err);
  }
}

async function readFile(req, res, next) {
  try {
    const filePath = req.params.name || req.params[0];
    const file = await fileService.readFile(filePath);
    res.json({ success: true, data: file });
  } catch (err) {
    if (err.code === 'ENOENT') {
      err.message = 'File not found.';
      err.statusCode = 404;
    }
    next(err);
  }
}

async function createFile(req, res, next) {
  try {
    const { name, content, type } = req.body;

    if (!name) {
      const err = new Error('File/folder name is required.');
      err.statusCode = 400;
      throw err;
    }

    let result;
    if (type === 'folder') {
      result = await fileService.createFolder(name);
    } else {
      result = await fileService.createFile(name, content || '');
    }

    res.status(201).json({ success: true, message: `${type === 'folder' ? 'Folder' : 'File'} created successfully.`, data: result });
  } catch (err) {
    next(err);
  }
}

async function updateFile(req, res, next) {
  try {
    const filePath = req.params.name || req.params[0];
    const { content } = req.body;

    if (content === undefined) {
      const err = new Error('Content is required.');
      err.statusCode = 400;
      throw err;
    }

    const result = await fileService.updateFile(filePath, content);
    res.json({ success: true, message: 'File updated successfully.', data: result });
  } catch (err) {
    if (err.code === 'ENOENT') {
      err.message = 'File not found.';
      err.statusCode = 404;
    }
    next(err);
  }
}

async function renameFile(req, res, next) {
  try {
    const oldPath = req.params.name || req.params[0];
    const { newName } = req.body;

    if (!newName) {
      const err = new Error('New name is required.');
      err.statusCode = 400;
      throw err;
    }

    const result = await fileService.renameFile(oldPath, newName);
    res.json({ success: true, message: 'File renamed successfully.', data: result });
  } catch (err) {
    next(err);
  }
}

async function deleteFile(req, res, next) {
  try {
    const filePath = req.params.name || req.params[0];
    const result = await fileService.deleteFile(filePath);
    res.json({ success: true, message: 'Deleted successfully.', data: result });
  } catch (err) {
    if (err.code === 'ENOENT') {
      err.message = 'File not found.';
      err.statusCode = 404;
    }
    next(err);
  }
}

module.exports = { listFiles, readFile, createFile, updateFile, renameFile, deleteFile };
