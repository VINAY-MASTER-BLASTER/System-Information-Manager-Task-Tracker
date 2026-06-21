/**
 * System Information Page
 */
const SystemInfoPage = {
  async render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <h2>🖥️ System Information</h2>
        <p class="page-subtitle">Detailed hardware and software information</p>
      </div>
      <div class="toolbar">
        <div class="toolbar-right">
          <button class="btn" id="refresh-sysinfo" aria-label="Refresh">🔄 Refresh</button>
          <button class="btn btn-primary" id="export-sysinfo" aria-label="Export as JSON">📥 Export JSON</button>
        </div>
      </div>
      <div class="card-grid card-grid-2" id="sysinfo-cards">
        <div class="card"><div style="padding:40px;text-align:center;color:var(--text-muted);">Loading...</div></div>
      </div>
    `;

    document.getElementById('refresh-sysinfo').addEventListener('click', () => this._load());
    document.getElementById('export-sysinfo').addEventListener('click', () => this._export());

    await this._load();
  },

  async _load() {
    try {
      const res = await API.getSystemInfo();
      const d = res.data;

      document.getElementById('sysinfo-cards').innerHTML = `
        ${this._card('🖥️', 'Operating System', 'primary', [
          ['Name', d.os.name],
          ['Version', d.os.version],
          ['Release', d.os.release],
          ['Uptime', d.os.uptime],
        ])}
        ${this._card('⚡', 'CPU', 'accent', [
          ['Architecture', d.cpu.architecture],
          ['Cores', d.cpu.cores],
          ['Model', d.cpu.model],
          ['Speed', d.cpu.speed],
        ])}
        ${this._card('📡', 'Device', 'info', [
          ['Hostname', d.device.hostname],
          ['Platform', d.device.platform],
          ['Home Directory', d.device.homeDirectory],
          ['Temp Directory', d.device.tempDirectory],
        ])}
        ${this._card('🟢', 'Node.js', 'success', [
          ['Version', d.node.nodeVersion],
          ['V8 Version', d.node.v8Version],
          ['Process ID', d.node.processId],
        ])}
        ${this._card('💾', 'Memory', 'warning', [
          ['Total', d.memory.total],
          ['Used', d.memory.used],
          ['Free', d.memory.free],
          ['Usage', d.memory.usagePercent + '%'],
        ])}
      `;

      // store for export
      this._lastData = d;
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _card(icon, title, color, items) {
    const rows = items.map(([label, value]) => `
      <li class="info-item">
        <span class="info-label">${label}</span>
        <span class="info-value">${value}</span>
      </li>
    `).join('');

    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon ${color}">${icon}</div>
          <div class="card-title">${title}</div>
        </div>
        <ul class="info-list">${rows}</ul>
      </div>
    `;
  },

  _export() {
    if (!this._lastData) return App.toast('No data to export', 'warning');
    const blob = new Blob([JSON.stringify(this._lastData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-info-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast('System info exported!', 'success');
  },

  destroy() {},
};
