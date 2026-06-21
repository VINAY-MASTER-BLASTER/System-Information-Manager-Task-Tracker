/**
 * File Manager Page
 */
const FileManagerPage = {
  currentFile: null,
  fileTree: [],
  isDirty: false,

  async render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <h2>📁 File Manager</h2>
        <p class="page-subtitle">Manage files and folders in your workspace</p>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="breadcrumbs" id="breadcrumbs">
            <span class="breadcrumb-item" onclick="FileManagerPage._navigateRoot()">🏠 workspace</span>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" id="btn-new-file" aria-label="New file">📄 New File</button>
          <button class="btn btn-accent" id="btn-new-folder" aria-label="New folder">📂 New Folder</button>
          <button class="btn" id="btn-refresh-tree" aria-label="Refresh">🔄</button>
        </div>
      </div>

      <div class="file-manager-layout">
        <!-- File Tree -->
        <div class="file-tree-panel">
          <div class="file-tree-header">
            <span>Explorer</span>
            <div class="search-box" style="width:140px;">
              <input class="input" id="file-search" placeholder="Search..." style="padding-left:28px;font-size:0.78rem;" aria-label="Search files" />
            </div>
          </div>
          <div class="file-tree-body" id="file-tree"></div>
        </div>

        <!-- Editor -->
        <div class="editor-panel">
          <div class="editor-header" id="editor-header">
            <div class="editor-filename" id="editor-filename">
              <span>No file selected</span>
            </div>
            <div class="editor-actions" id="editor-actions" style="display:none;">
              <span class="editor-meta" id="editor-meta"></span>
              <button class="btn btn-primary btn-sm" id="btn-save" aria-label="Save file">💾 Save</button>
              <button class="btn btn-sm" id="btn-rename" aria-label="Rename file">✏️ Rename</button>
              <button class="btn btn-danger btn-sm" id="btn-delete" aria-label="Delete file">🗑️ Delete</button>
            </div>
          </div>
          <div class="editor-body" id="editor-body">
            <div class="editor-empty" id="editor-empty">
              <div>
                <div class="editor-empty-icon">📝</div>
                <p>Select a file to edit or create a new one</p>
                <p style="font-size:0.78rem;margin-top:8px;color:var(--text-muted);">
                  <kbd>Ctrl</kbd>+<kbd>N</kbd> New File &nbsp; <kbd>Ctrl</kbd>+<kbd>S</kbd> Save
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-new-file').addEventListener('click', () => this._showCreateModal('file'));
    document.getElementById('btn-new-folder').addEventListener('click', () => this._showCreateModal('folder'));
    document.getElementById('btn-refresh-tree').addEventListener('click', () => this._loadTree());
    document.getElementById('file-search').addEventListener('input', (e) => this._filterTree(e.target.value));

    await this._loadTree();
  },

  async _loadTree() {
    try {
      const res = await API.listFiles();
      this.fileTree = res.data.files;
      this._renderTree(this.fileTree);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _renderTree(items, container) {
    const el = container || document.getElementById('file-tree');
    if (!el) return;

    if (items.length === 0) {
      el.innerHTML = `
        <div class="empty-state" style="padding:24px;">
          <div class="empty-state-icon">📭</div>
          <p class="empty-state-text">Workspace is empty</p>
          <button class="btn btn-primary btn-sm" onclick="FileManagerPage._showCreateModal('file')">Create a file</button>
        </div>
      `;
      return;
    }

    el.innerHTML = this._buildTreeHTML(items);
  },

  _buildTreeHTML(items) {
    return items.map((item) => {
      if (item.type === 'folder') {
        return `
          <div class="tree-node">
            <div class="tree-item" onclick="FileManagerPage._toggleFolder(this)" data-path="${item.path}">
              <span class="tree-item-icon">📂</span>
              <span class="tree-item-name">${item.name}</span>
            </div>
            <div class="tree-children">${item.children ? this._buildTreeHTML(item.children) : ''}</div>
          </div>
        `;
      }
      return `
        <div class="tree-item" onclick="FileManagerPage._selectFile('${item.path.replace(/'/g, "\\'")}')" data-path="${item.path}">
          <span class="tree-item-icon">${this._fileIcon(item.extension)}</span>
          <span class="tree-item-name">${item.name}</span>
        </div>
      `;
    }).join('');
  },

  _fileIcon(ext) {
    const icons = {
      '.js': '📜', '.ts': '🔷', '.json': '📋', '.html': '🌐',
      '.css': '🎨', '.md': '📖', '.txt': '📄', '.xml': '📰',
      '.yaml': '⚙️', '.yml': '⚙️',
    };
    return icons[ext] || '📄';
  },

  _toggleFolder(el) {
    const children = el.nextElementSibling;
    if (children) children.classList.toggle('collapsed');
    const icon = el.querySelector('.tree-item-icon');
    icon.textContent = children?.classList.contains('collapsed') ? '📁' : '📂';
  },

  async _selectFile(filePath) {
    if (this.isDirty && !confirm('You have unsaved changes. Discard?')) return;

    // Remove active class
    document.querySelectorAll('.tree-item.active').forEach((el) => el.classList.remove('active'));
    const treeItem = document.querySelector(`.tree-item[data-path="${filePath}"]`);
    if (treeItem) treeItem.classList.add('active');

    try {
      const res = await API.readFile(filePath);
      this.currentFile = res.data;
      this.isDirty = false;

      const filename = document.getElementById('editor-filename');
      const meta = document.getElementById('editor-meta');
      const actions = document.getElementById('editor-actions');
      const body = document.getElementById('editor-body');

      filename.innerHTML = `<span>${this._fileIcon(this.currentFile.extension)}</span> ${this.currentFile.name}`;
      meta.textContent = `${this._formatSize(this.currentFile.size)} • Modified: ${new Date(this.currentFile.modified).toLocaleString()}`;
      actions.style.display = 'flex';

      body.innerHTML = `<textarea class="code-editor" id="code-editor" spellcheck="false" aria-label="Code editor">${this._escapeHtml(this.currentFile.content)}</textarea>`;

      const editor = document.getElementById('code-editor');
      editor.addEventListener('input', () => { this.isDirty = true; });

      // Wire up action buttons
      document.getElementById('btn-save').onclick = () => this._saveFile();
      document.getElementById('btn-rename').onclick = () => this._showRenameModal();
      document.getElementById('btn-delete').onclick = () => this._confirmDelete();

      // Update breadcrumbs
      this._updateBreadcrumbs(filePath);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async _saveFile() {
    if (!this.currentFile) return;
    const editor = document.getElementById('code-editor');
    if (!editor) return;

    try {
      await API.updateFile(this.currentFile.path, editor.value);
      this.isDirty = false;
      App.toast('File saved successfully!', 'success');
      App.addActivity('💾', `Saved ${this.currentFile.name}`);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _showCreateModal(type) {
    const isFolder = type === 'folder';
    App.showModal(
      isFolder ? '📂 New Folder' : '📄 New File',
      `
        <div class="input-group">
          <label for="create-name">Name</label>
          <input class="input" id="create-name" placeholder="${isFolder ? 'folder-name' : 'filename.js'}" autofocus />
        </div>
        ${!isFolder ? `
        <div class="input-group">
          <label for="create-content">Content (optional)</label>
          <textarea class="textarea" id="create-content" placeholder="// Your code here..."></textarea>
        </div>
        ` : ''}
      `,
      [
        { text: 'Cancel', class: 'btn', action: () => App.hideModal() },
        {
          text: isFolder ? 'Create Folder' : 'Create File',
          class: 'btn btn-primary',
          action: async () => {
            const name = document.getElementById('create-name').value.trim();
            if (!name) return App.toast('Name is required', 'warning');
            try {
              const content = !isFolder ? (document.getElementById('create-content')?.value || '') : '';
              await API.createFile(name, content, type);
              App.toast(`${isFolder ? 'Folder' : 'File'} created!`, 'success');
              App.addActivity(isFolder ? '📂' : '📄', `Created ${name}`);
              App.hideModal();
              await this._loadTree();
            } catch (err) {
              App.toast(err.message, 'error');
            }
          },
        },
      ]
    );
  },

  _showRenameModal() {
    if (!this.currentFile) return;
    App.showModal(
      '✏️ Rename File',
      `
        <div class="input-group">
          <label for="rename-name">New name</label>
          <input class="input" id="rename-name" value="${this.currentFile.name}" autofocus />
        </div>
      `,
      [
        { text: 'Cancel', class: 'btn', action: () => App.hideModal() },
        {
          text: 'Rename',
          class: 'btn btn-primary',
          action: async () => {
            const newName = document.getElementById('rename-name').value.trim();
            if (!newName) return App.toast('Name is required', 'warning');
            try {
              await API.renameFile(this.currentFile.path, newName);
              App.toast('File renamed!', 'success');
              App.addActivity('✏️', `Renamed to ${newName}`);
              App.hideModal();
              this.currentFile = null;
              this.isDirty = false;
              await this._loadTree();
              // Reset editor
              document.getElementById('editor-body').innerHTML = `
                <div class="editor-empty" id="editor-empty">
                  <div><div class="editor-empty-icon">📝</div><p>Select a file to edit</p></div>
                </div>`;
              document.getElementById('editor-actions').style.display = 'none';
              document.getElementById('editor-filename').innerHTML = 'No file selected';
            } catch (err) {
              App.toast(err.message, 'error');
            }
          },
        },
      ]
    );
  },

  _confirmDelete() {
    if (!this.currentFile) return;
    App.showModal(
      '🗑️ Delete File',
      `<p style="color:var(--danger);">Are you sure you want to delete <strong>${this.currentFile.name}</strong>? This cannot be undone.</p>`,
      [
        { text: 'Cancel', class: 'btn', action: () => App.hideModal() },
        {
          text: 'Delete',
          class: 'btn btn-danger',
          action: async () => {
            try {
              await API.deleteFile(this.currentFile.path);
              App.toast('File deleted!', 'success');
              App.addActivity('🗑️', `Deleted ${this.currentFile.name}`);
              App.hideModal();
              this.currentFile = null;
              this.isDirty = false;
              await this._loadTree();
              document.getElementById('editor-body').innerHTML = `
                <div class="editor-empty" id="editor-empty">
                  <div><div class="editor-empty-icon">📝</div><p>Select a file to edit</p></div>
                </div>`;
              document.getElementById('editor-actions').style.display = 'none';
              document.getElementById('editor-filename').innerHTML = 'No file selected';
            } catch (err) {
              App.toast(err.message, 'error');
            }
          },
        },
      ]
    );
  },

  _filterTree(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#file-tree .tree-item').forEach((el) => {
      const name = el.querySelector('.tree-item-name')?.textContent.toLowerCase() || '';
      el.style.display = name.includes(q) ? '' : 'none';
    });
  },

  _updateBreadcrumbs(filePath) {
    const parts = filePath.split('/');
    const crumbs = ['<span class="breadcrumb-item" onclick="FileManagerPage._navigateRoot()">🏠 workspace</span>'];
    for (let i = 0; i < parts.length; i++) {
      crumbs.push('<span class="breadcrumb-sep">/</span>');
      crumbs.push(`<span class="breadcrumb-item">${parts[i]}</span>`);
    }
    document.getElementById('breadcrumbs').innerHTML = crumbs.join('');
  },

  _navigateRoot() {
    this._loadTree();
  },

  _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  destroy() {
    this.currentFile = null;
    this.isDirty = false;
  },
};
