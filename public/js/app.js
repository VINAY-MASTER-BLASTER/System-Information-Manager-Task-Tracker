/**
 * App — Main SPA Controller
 */
const App = {
  currentPage: null,
  pages: {
    dashboard: DashboardPage,
    system: SystemInfoPage,
    env: EnvVarsPage,
    files: FileManagerPage,
    settings: SettingsPage,
  },

  init() {
    // Restore theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Navigation
    this._bindNav();

    // Mobile menu
    this._bindMobileMenu();

    // Keyboard shortcuts
    this._bindKeyboard();

    // Route based on hash
    this._route();
    window.addEventListener('hashchange', () => this._route());
  },

  // ── Routing ──────────────────────────────────────────────
  _route() {
    const hash = (location.hash || '#dashboard').replace('#', '');
    const page = this.pages[hash];
    if (!page) return this.navigate('dashboard');
    this._renderPage(hash, page);
  },

  navigate(pageName) {
    location.hash = '#' + pageName;
  },

  _renderPage(name, page) {
    // Destroy previous page
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.page === name);
    });

    this.currentPage = page;
    page.render();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  },

  _bindNav() {
    document.querySelectorAll('.nav-item').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.page);
      });
    });
  },

  // ── Mobile Menu ──────────────────────────────────────────
  _bindMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  },

  // ── Keyboard Shortcuts ───────────────────────────────────
  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+S — save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (FileManagerPage.currentFile) FileManagerPage._saveFile();
      }

      // Ctrl+N — new file
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.navigate('files');
        setTimeout(() => FileManagerPage._showCreateModal('file'), 100);
      }

      // Escape — close modal
      if (e.key === 'Escape') {
        this.hideModal();
      }

      // Number keys for navigation (when not in input)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        const map = { '1': 'dashboard', '2': 'system', '3': 'env', '4': 'files', '5': 'settings' };
        if (map[e.key]) this.navigate(map[e.key]);
      }
    });
  },

  // ── Toast Notifications ──────────────────────────────────
  toast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;

    toast.addEventListener('click', () => this._removeToast(toast));
    container.appendChild(toast);

    setTimeout(() => this._removeToast(toast), 4000);
  },

  _removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  },

  // ── Modal ────────────────────────────────────────────────
  showModal(title, bodyHTML, buttons = []) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;

    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    buttons.forEach((btn) => {
      const el = document.createElement('button');
      el.className = btn.class || 'btn';
      el.textContent = btn.text;
      el.addEventListener('click', btn.action);
      footer.appendChild(el);
    });

    document.getElementById('modal-backdrop').classList.remove('hidden');

    // Focus first input
    setTimeout(() => {
      const input = document.querySelector('#modal-body input, #modal-body textarea');
      if (input) input.focus();
    }, 100);
  },

  hideModal() {
    document.getElementById('modal-backdrop').classList.add('hidden');
  },

  // ── Activity Log ─────────────────────────────────────────
  addActivity(icon, text) {
    const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
    log.unshift({ icon, text, time: new Date().toISOString() });
    if (log.length > 50) log.length = 50;
    localStorage.setItem('activityLog', JSON.stringify(log));

    // Update if activity log is visible
    const logEl = document.getElementById('activity-log');
    if (logEl) {
      const item = document.createElement('li');
      item.className = 'activity-item';
      item.innerHTML = `
        <span class="activity-icon">${icon}</span>
        <span class="activity-text">${text}</span>
        <span class="activity-time">just now</span>
      `;
      logEl.prepend(item);
    }
  },
};

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Modal close handlers
  document.getElementById('modal-close').addEventListener('click', () => App.hideModal());
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-backdrop')) App.hideModal();
  });

  App.init();
});
