/**
 * Environment Variables Page
 */
const EnvVarsPage = {
  masked: true,

  async render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <h2>🔑 Environment Variables</h2>
        <p class="page-subtitle">Selected environment variables from the host system</p>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box" style="width:300px;">
            <input class="input" id="env-search" placeholder="Search variables..." aria-label="Search environment variables" />
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn" id="toggle-mask" aria-label="Toggle value visibility">
            👁️ ${this.masked ? 'Show' : 'Hide'} Values
          </button>
          <button class="btn" id="refresh-env" aria-label="Refresh">🔄 Refresh</button>
        </div>
      </div>

      <div class="table-wrapper" id="env-table-wrapper">
        <table class="data-table" id="env-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="env-tbody">
            <tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('env-search').addEventListener('input', (e) => this._load(e.target.value));
    document.getElementById('toggle-mask').addEventListener('click', () => this._toggleMask());
    document.getElementById('refresh-env').addEventListener('click', () => this._load());

    await this._load();
  },

  async _load(search = '') {
    try {
      const res = await API.getEnvVars(search);
      const vars = res.data;
      const tbody = document.getElementById('env-tbody');

      if (vars.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted);">No matching variables</td></tr>`;
        return;
      }

      tbody.innerHTML = vars.map((v) => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td>
            <span class="env-value ${this.masked && v.name === 'PATH' ? 'masked' : ''}" title="${this._escapeHtml(v.value)}">
              ${this._truncate(v.value, 80)}
            </span>
          </td>
          <td>
            ${v.isSet
              ? '<span class="badge badge-success">Set</span>'
              : '<span class="badge badge-warning">Not set</span>'}
          </td>
          <td>
            <button class="btn btn-sm btn-icon" onclick="EnvVarsPage._copy('${this._escapeAttr(v.value)}')" aria-label="Copy value" title="Copy to clipboard">
              📋
            </button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _toggleMask() {
    this.masked = !this.masked;
    const btn = document.getElementById('toggle-mask');
    if (btn) btn.innerHTML = `👁️ ${this.masked ? 'Show' : 'Hide'} Values`;
    this._load(document.getElementById('env-search')?.value || '');
  },

  _copy(value) {
    navigator.clipboard.writeText(value).then(() => {
      App.toast('Copied to clipboard!', 'success');
    }).catch(() => {
      App.toast('Failed to copy', 'error');
    });
  },

  _truncate(str, max) {
    if (str.length <= max) return this._escapeHtml(str);
    return this._escapeHtml(str.slice(0, max)) + '…';
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/\\/g, '\\\\');
  },

  destroy() {},
};
