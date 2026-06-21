/**
 * Settings Page
 */
const SettingsPage = {
  render() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const interval = localStorage.getItem('refreshInterval') || '5000';

    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <h2>⚡ Settings</h2>
        <p class="page-subtitle">Configure your dashboard preferences</p>
      </div>

      <div class="settings-grid">

        <div class="settings-section">
          <h3>🎨 Appearance</h3>
          <div class="toggle-wrapper">
            <div>
              <div class="toggle-label">Dark Mode</div>
              <div class="toggle-desc">Use dark color scheme</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-theme" ${isDark ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>🔄 Auto-Refresh</h3>
          <div class="toggle-wrapper" style="flex-direction:column;align-items:stretch;gap:12px;">
            <div>
              <div class="toggle-label">Refresh Interval</div>
              <div class="toggle-desc">How often dashboard data refreshes (milliseconds)</div>
            </div>
            <div class="input-group">
              <select class="select" id="refresh-interval" aria-label="Refresh interval">
                <option value="0" ${interval === '0' ? 'selected' : ''}>Disabled</option>
                <option value="2000" ${interval === '2000' ? 'selected' : ''}>2 seconds</option>
                <option value="5000" ${interval === '5000' ? 'selected' : ''}>5 seconds</option>
                <option value="10000" ${interval === '10000' ? 'selected' : ''}>10 seconds</option>
                <option value="30000" ${interval === '30000' ? 'selected' : ''}>30 seconds</option>
                <option value="60000" ${interval === '60000' ? 'selected' : ''}>60 seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>📥 Data</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-export-all" aria-label="Export all data">📥 Export Full Report</button>
            <button class="btn" id="btn-clear-activity" aria-label="Clear activity log">🗑️ Clear Activity Log</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <div class="card" style="padding:16px;">
            <ul class="info-list">
              <li class="info-item"><span class="info-label"><kbd>Ctrl</kbd>+<kbd>S</kbd></span><span class="info-value">Save current file</span></li>
              <li class="info-item"><span class="info-label"><kbd>Ctrl</kbd>+<kbd>N</kbd></span><span class="info-value">Create new file</span></li>
              <li class="info-item"><span class="info-label"><kbd>Esc</kbd></span><span class="info-value">Close modal</span></li>
              <li class="info-item"><span class="info-label"><kbd>1</kbd>–<kbd>5</kbd></span><span class="info-value">Navigate pages</span></li>
            </ul>
          </div>
        </div>

      </div>
    `;

    // Theme toggle
    document.getElementById('toggle-theme').addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      App.toast(`${theme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode enabled`, 'info');
    });

    // Refresh interval
    document.getElementById('refresh-interval').addEventListener('change', (e) => {
      localStorage.setItem('refreshInterval', e.target.value);
      App.toast('Refresh interval updated', 'info');
    });

    // Export full report
    document.getElementById('btn-export-all').addEventListener('click', async () => {
      try {
        const [sysRes, envRes, filesRes] = await Promise.all([
          API.getSystemInfo(),
          API.getEnvVars(),
          API.listFiles(),
        ]);
        const report = {
          exportedAt: new Date().toISOString(),
          system: sysRes.data,
          environment: envRes.data,
          workspace: filesRes.data,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `full-report-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        App.toast('Full report exported!', 'success');
      } catch (err) {
        App.toast(err.message, 'error');
      }
    });

    // Clear activity
    document.getElementById('btn-clear-activity').addEventListener('click', () => {
      localStorage.removeItem('activityLog');
      App.toast('Activity log cleared', 'info');
    });
  },

  destroy() {},
};
