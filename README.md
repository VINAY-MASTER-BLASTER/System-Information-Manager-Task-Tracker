# 🖥️ System Information Manager

A modern, professional Node.js dashboard application for gathering system information, inspecting environment variables, and managing workspace files — all from a beautiful, responsive web interface.

> ⚠️ **This is NOT malware.** The application only accesses files inside a user-defined `workspace/` directory and reads system information using standard Node.js APIs. No system files are modified.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Overview cards for OS, CPU, Memory, Node.js, and workspace stats with live memory chart |
| 🖥️ **System Information** | Detailed hardware/software info with export to JSON |
| 🔑 **Environment Variables** | Searchable table with copy, mask/unmask, and status badges |
| 📁 **File Manager** | Full CRUD — create, read, edit, rename, delete files and folders |
| 🎨 **Dark / Light Mode** | Glassmorphic UI with theme toggle and persistent preference |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+S` save, `Ctrl+N` new file, `1-5` page navigation |
| 🔄 **Auto-Refresh** | Configurable live memory updates (2s – 60s) |
| 📥 **Export Reports** | Download full system + workspace report as JSON |
| 🔒 **Security** | Path traversal protection, rate limiting, input sanitization |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or later
- **npm**

### Installation

```bash
# Clone or navigate to project directory
cd "THUNDER HACKATHON 3.0"

# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload (development)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📂 Folder Structure

```
THUNDER HACKATHON 3.0/
├── package.json
├── README.md
├── .gitignore
├── workspace/               # Controlled CRUD directory
│   └── hello.js             # Sample seed file
├── src/
│   ├── app.js               # Express entry point
│   ├── config/
│   │   └── index.js         # Centralized configuration
│   ├── controllers/
│   │   ├── systemController.js
│   │   ├── envController.js
│   │   └── fileController.js
│   ├── services/
│   │   ├── systemService.js  # os module wrappers
│   │   ├── envService.js     # Environment variable logic
│   │   └── fileService.js    # File system CRUD
│   ├── routes/
│   │   ├── systemRoutes.js
│   │   ├── envRoutes.js
│   │   └── fileRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handling
│   │   └── validatePath.js   # Path traversal prevention
│   └── utils/
│       └── helpers.js        # formatBytes, formatUptime, sanitize
└── public/
    ├── index.html            # SPA shell
    ├── css/
    │   └── style.css         # Complete design system
    └── js/
        ├── api.js            # Fetch wrapper
        ├── app.js            # SPA router & core
        └── pages/
            ├── dashboard.js
            ├── systemInfo.js
            ├── envVars.js
            ├── fileManager.js
            └── settings.js
```

---

## 🔄 Code Flow

```
User opens browser → http://localhost:3000
         │
         ▼
   public/index.html (SPA shell)
         │
         ▼
   app.js (hash router) → renders page module
         │
         ▼
   api.js (fetch wrapper) → sends HTTP requests
         │
         ▼
  ┌──────────────────────────┐
  │     Express Backend      │
  │                          │
  │  Routes → Controllers    │
  │      → Services          │
  │      → Node.js APIs      │
  │  (os, fs, process)       │
  └──────────────────────────┘
         │
         ▼
   JSON response → UI renders cards/tables/editor
```

### Detailed Flow

1. **User opens dashboard** → `index.html` loads, `app.js` initializes hash router
2. **Frontend requests data** → `api.js` sends `GET /api/system`, `GET /api/files`
3. **Backend gathers data** → `systemService.js` calls `os.cpus()`, `os.totalmem()`, etc.
4. **Data is formatted** → `helpers.js` converts bytes/uptime to human-readable strings
5. **UI renders** → Page modules create cards, tables, charts using DOM manipulation
6. **User performs file ops** → Modals collect input → `POST/PUT/DELETE /api/files`
7. **Backend validates** → `validatePath.js` prevents traversal, `fileService.js` checks extensions
8. **Workspace modified** → `fs/promises` creates/updates/deletes within `workspace/` only
9. **Response returned** → Toast notification confirms success/failure

---

## 🛡️ Strategy

### Information Gathering
Uses built-in Node.js modules (`os`, `process`) — no external dependencies for system data. All values formatted for readability.

### File Management
Service-layer abstraction (`fileService.js`) wraps `fs/promises` with path resolution, validation, and error mapping. All operations are confined to the `workspace/` directory.

### Security Strategy
- **Path traversal prevention**: Every file path is resolved and checked against the workspace root
- **Extension allowlist**: Only `.js`, `.ts`, `.json`, `.txt`, `.md`, `.html`, `.css`, `.xml`, `.yaml`, `.yml`
- **Filename sanitization**: Dangerous characters stripped
- **Rate limiting**: 200 requests per 15 minutes on API endpoints
- **Input validation**: Required fields checked, file size limited to 1 MB

### Error Handling Strategy
- Centralized `errorHandler.js` middleware catches all errors
- Structured JSON responses: `{ success: false, message: "..." }`
- HTTP status codes: 400 (bad request), 403 (forbidden), 404 (not found), 409 (conflict), 413 (too large), 500 (server error)
- Frontend shows toast notifications for all errors

### UI Strategy
- Card-based responsive dashboard with CSS Grid
- Glassmorphic design with `backdrop-filter: blur()`
- Dark mode by default, light mode via toggle
- Staggered fade-in animations for cards
- Loading skeletons while data fetches
- Canvas-based donut chart for memory usage

---

## 📡 API Documentation

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/system` | All system information |
| `GET` | `/api/system/memory` | Memory info only (for live refresh) |

### Environment

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/env` | Selected environment variables |
| `GET` | `/api/env?search=PATH` | Search variables by name |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files` | List workspace tree + stats |
| `POST` | `/api/files` | Create file or folder |
| `GET` | `/api/files/:path` | Read file content + metadata |
| `PUT` | `/api/files/:path` | Update file content |
| `PATCH` | `/api/files/:path` | Rename / move file |
| `DELETE` | `/api/files/:path` | Delete file or folder |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "File not found."
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+N` | Create new file |
| `Esc` | Close modal |
| `1` – `5` | Navigate to pages |

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework & static file serving |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | API rate limiting |
| `nodemon` (dev) | Auto-restart on file changes |

---

## 📄 License

@VINAYTOPPO
