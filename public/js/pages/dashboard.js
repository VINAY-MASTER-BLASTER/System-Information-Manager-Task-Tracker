/**
 * Dashboard Page
 */
const DashboardPage = {
  refreshTimer: null,

  async render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <h2>📊 Dashboard</h2>
        <p class="page-subtitle">System overview and workspace statistics at a glance</p>
      </div>

      <div class="card-grid" id="dashboard-cards">
        ${this._skeleton()}
      </div>

      <div class="charts-row" id="dashboard-charts">
        <div class="card">
          <div class="card-header">
            <div class="card-icon primary">📈</div>
            <div class="card-title">Memory Usage</div>
          </div>
          <div class="chart-container">
            <canvas id="memory-chart" width="200" height="200"></canvas>
            <div class="chart-center-label">
              <div class="chart-center-value" id="memory-pct">—</div>
              <div class="chart-center-text">Used</div>
            </div>
          </div>
          <div id="memory-detail" class="card-detail" style="text-align:center;"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon accent">📋</div>
            <div class="card-title">Activity Log</div>
          </div>
          <ul class="activity-log" id="activity-log">
            <li class="activity-item">
              <span class="activity-icon">🟢</span>
              <span class="activity-text">Dashboard loaded</span>
              <span class="activity-time">just now</span>
            </li>
          </ul>
        </div>
      </div>
    `;

    await this._loadData();
    this._startAutoRefresh();
  },

  async _loadData() {
    try {
      const [sysRes, filesRes] = await Promise.all([
        API.getSystemInfo(),
        API.listFiles(),
      ]);

      const sys = sysRes.data;
      const stats = filesRes.data.stats;

      document.getElementById('dashboard-cards').innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-icon primary">🖥️</div>
            <div class="card-title">Operating System</div>
          </div>
          <div class="card-value">${sys.os.name}</div>
          <div class="card-detail">${sys.os.release} • Uptime: ${sys.os.uptime}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon accent">⚡</div>
            <div class="card-title">CPU</div>
          </div>
          <div class="card-value">${sys.cpu.cores} Cores</div>
          <div class="card-detail">${sys.cpu.model}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon warning">💾</div>
            <div class="card-title">Memory</div>
          </div>
          <div class="card-value">${sys.memory.usagePercent}%</div>
          <div class="card-detail">${sys.memory.used} / ${sys.memory.total}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${sys.memory.usagePercent}%"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon success">🟢</div>
            <div class="card-title">Node.js</div>
          </div>
          <div class="card-value">${sys.node.nodeVersion}</div>
          <div class="card-detail">V8 ${sys.node.v8Version} • PID ${sys.node.processId}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon info">📁</div>
            <div class="card-title">Workspace</div>
          </div>
          <div class="card-value">${stats.totalFiles} Files</div>
          <div class="card-detail">${stats.totalFolders} folders • ${this._formatBytes(stats.totalSize)}</div>
        </div>
      `;

      this._drawMemoryChart(sys.memory.usagePercent);
      document.getElementById('memory-pct').textContent = `${sys.memory.usagePercent}%`;
      document.getElementById('memory-detail').textContent = `${sys.memory.used} used of ${sys.memory.total}`;

    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _drawMemoryChart(percent) {
    const canvas = document.getElementById('memory-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2, cy = size / 2, r = 80, lw = 14;

    ctx.clearRect(0, 0, size, size);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lw;
    ctx.stroke();

    // Progress ring
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * percent / 100);
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6c63ff');
    gradient.addColorStop(1, '#00d4aa');

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  },

  _startAutoRefresh() {
    this._stopAutoRefresh();
    const interval = parseInt(localStorage.getItem('refreshInterval') || '5000', 10);
    if (interval > 0) {
      this.refreshTimer = setInterval(async () => {
        try {
          const res = await API.getMemoryInfo();
          const mem = res.data;
          const pctEl = document.getElementById('memory-pct');
          const detailEl = document.getElementById('memory-detail');
          if (pctEl) {
            pctEl.textContent = `${mem.usagePercent}%`;
            detailEl.textContent = `${mem.used} used of ${mem.total}`;
            this._drawMemoryChart(mem.usagePercent);
          }
        } catch { /* silent */ }
      }, interval);
    }
  },

  _stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  },

  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  _skeleton() {
    return Array(5).fill(`
      <div class="card" style="min-height:120px;">
        <div style="height:14px;width:40%;background:var(--bg-surface);border-radius:4px;margin-bottom:12px;animation:pulse 1.5s infinite;"></div>
        <div style="height:24px;width:60%;background:var(--bg-surface);border-radius:4px;margin-bottom:8px;animation:pulse 1.5s infinite;"></div>
        <div style="height:10px;width:80%;background:var(--bg-surface);border-radius:4px;animation:pulse 1.5s infinite;"></div>
      </div>
    `).join('');
  },

  destroy() {
    this._stopAutoRefresh();
  },
};
