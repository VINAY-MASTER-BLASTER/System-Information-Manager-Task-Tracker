/**
 * API Client — Fetch wrapper for all backend endpoints
 */
const API = {
  /** Base URL (same origin) */
  base: '/api',

  /**
   * Generic fetch helper
   */
  async request(path, options = {}) {
    const url = `${this.base}${path}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Is it running?');
      }
      throw err;
    }
  },

  // ── System ──────────────────────────────────────────────
  getSystemInfo() {
    return this.request('/system');
  },

  getMemoryInfo() {
    return this.request('/system/memory');
  },

  // ── Environment ─────────────────────────────────────────
  getEnvVars(search = '') {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/env${q}`);
  },

  // ── Files ───────────────────────────────────────────────
  listFiles() {
    return this.request('/files');
  },

  readFile(name) {
    return this.request(`/files/${encodeURIComponent(name)}`);
  },

  createFile(name, content = '', type = 'file') {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify({ name, content, type }),
    });
  },

  updateFile(name, content) {
    return this.request(`/files/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  renameFile(name, newName) {
    return this.request(`/files/${encodeURIComponent(name)}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ newName }),
    });
  },

  deleteFile(name) {
    return this.request(`/files/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },
};
