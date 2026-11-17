# Taanavana — Setup & Run Guide

## ⚡ Quick Start (30 seconds)

### Step 1 — Start the backend
Open **Terminal** and run:
```bash
cd "/Users/rishiraj/Desktop/CSE326 project1"
bash start.sh
```
You'll see:
```
✅  Backend is running: http://localhost:5001
```

### Step 2 — Open the website in VS Code
1. Open VS Code → open the folder `CSE326 project1`
2. Right-click `index.html` → **"Open with Live Server"**
3. The site opens at `http://127.0.0.1:5500`

---

## 📱 Open on Phone or Another Laptop

The site is accessible from **any device on the same WiFi network**.

| Device | URL to open |
|--------|-------------|
| Your Mac | `http://127.0.0.1:5500` |
| Phone / Other laptop | `http://172.26.89.96:5500` |

> **Your local IP is `172.26.89.96`** — if it changes, run `ipconfig getifaddr en0` to get the new one.

### Configure Live Server to work on the network
In VS Code → **Settings (⌘,)** → search `liveServer.settings.host` → set to `0.0.0.0`

Or add this to VS Code `settings.json`:
```json
{
  "liveServer.settings.host": "0.0.0.0",
  "liveServer.settings.port": 5500
}
```

---

## 🔧 Backend Info

| Item | Detail |
|------|--------|
| Port | **5001** (changed from 5000 — macOS uses 5000 for ControlCenter) |
| Health check | `http://localhost:5001/health` |
| Database | SQLite at `backend/db/taanavana.db` |
| Env file | `backend/.env` (auto-created) |

### Why can't I use port 5000?
macOS Monterey+ reserves port 5000 for **AirPlay Receiver / ControlCenter**. We use **5001** instead.

---

## 🌟 Features

| Feature | Status |
|---------|--------|
| Dark / Light mode | ✅ Toggle in header, saved across sessions |
| Punjabi language | ✅ Switch in header dropdown |
| Login splash screen | ✅ Email, Phone OTP, Google OAuth |
| Backend (Node.js + SQLite) | ✅ Crash-proof with PM2 support |
| Cart + Wishlist | ✅ localStorage, persists on reload |
| Product search + filters | ✅ Live search |
| Responsive (mobile/tablet/desktop) | ✅ |

---

## 🛑 Troubleshooting

### Backend not starting
```bash
# Check what's on port 5001
lsof -i :5001

# Kill it and restart
lsof -ti:5001 | xargs kill -9
cd "/Users/rishiraj/Desktop/CSE326 project1/backend"
node server.js
```

### Site not opening on phone
1. Make sure phone is on **same WiFi** as your Mac
2. Set Live Server host to `0.0.0.0` (see above)
3. Check firewall: System Settings → Firewall → allow Node.js and VS Code

### Auth splash not showing
- Clear localStorage in browser DevTools → Application → Local Storage → delete `taanavana_token`
- Refresh the page

---

## 🚀 For Production (later)
Deploy frontend to **Vercel / Netlify** (free)  
Deploy backend to **Railway / Render** (free tier)  
Add real Google OAuth keys in `backend/.env`  
Add Twilio for real SMS OTP  
