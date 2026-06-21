const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const systemRoutes = require('./routes/systemRoutes');
const envRoutes = require('./routes/envRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/system', systemRoutes);
app.use('/api/env', envRoutes);
app.use('/api/files', fileRoutes);

// ── SPA Fallback ─────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Centralised Error Handler ────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`\n  🚀  System Information Manager`);
  console.log(`  ➜  http://localhost:${config.PORT}`);
  console.log(`  📂  Workspace: ${config.WORKSPACE_DIR}\n`);
});

module.exports = app;
