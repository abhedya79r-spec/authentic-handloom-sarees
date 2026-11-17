#!/bin/bash
# ============================================================
#  start.sh — Taanavana One-Click Startup Script
#  Run this once: bash start.sh
#  Then open http://172.26.89.96:5500 on any device on WiFi
# ============================================================

echo ""
echo "🌿  Starting Tradition Wear..."
echo ""

# ── Kill any old instances on 5001 ──
echo "⚙️   Clearing port 5001..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 0.5

# ── Start Backend ──
BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
echo "🚀  Starting backend on port 5001..."
cd "$BACKEND_DIR"
node server.js &
BACKEND_PID=$!
sleep 1.5

# ── Verify backend ──
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
  echo "✅  Backend is running: http://localhost:5001"
else
  echo "⚠️   Backend may still be starting — wait 3 seconds then check:"
  echo "    curl http://localhost:5001/health"
fi

# ── Get local IP ──
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "YOUR_IP")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🖥️   Open on THIS Mac:    http://127.0.0.1:5500"
echo "  📱  Open on PHONE/LAPTOP: http://${LOCAL_IP}:5500"
echo "  🔧  Backend health:       http://localhost:5001/health"
echo "  👑  Admin Dashboard:      http://127.0.0.1:5500/admin.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👉  Now open index.html in VS Code → right-click → 'Open with Live Server'"
echo "    Make sure Live Server is set to serve on 0.0.0.0 (see README for settings)"
echo ""
echo "🔑  First time? Create the admin account:"
echo "    curl -X POST http://localhost:5001/api/admin/seed"
echo "    Then log in at admin.html with: admin@traditionwear.com / Admin@1234"
echo ""
echo "Press Ctrl+C to stop the backend when done."
echo ""

# ── Keep script alive until Ctrl+C ──
wait $BACKEND_PID
