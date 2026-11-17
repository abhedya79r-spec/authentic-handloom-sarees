// ============================================================
//  server.js — Taanavana Backend
//  Node.js + Express + SQLite (better-sqlite3)
//
//  CRASH-PROOF design:
//   • Global uncaughtException + unhandledRejection handlers
//   • Express global error middleware catches every route error
//   • SQLite WAL mode — survives power loss
//   • Rate limiting — prevents DoS / brute-force
//   • Helmet — sets secure HTTP headers
//   • Input validation on every route
//   • Transactions for multi-step DB writes
//   • Run under PM2 for automatic restart (see ecosystem.config.js)
// ============================================================

'use strict';

// ── Load environment variables FIRST ─────────────────────────
const path   = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// ── Crash guards — catch anything that slips through ─────────
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION — server will restart via PM2:', err);
  process.exit(1); // PM2 restarts automatically
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

// ── Imports ───────────────────────────────────────────────────
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const passport     = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuid } = require('uuid');

const { initDb, getDb }                = require('./db/init');
const { errorHandler }                 = require('./middleware/errorHandler');
const { signToken }                    = require('./middleware/auth');

const authRouter    = require('./routes/auth');
const productsRouter = require('./routes/products');
const ordersRouter  = require('./routes/orders');
const adminRouter   = require('./routes/admin');

// ── Initialize DB ─────────────────────────────────────────────
const db = initDb();

// ── App setup ─────────────────────────────────────────────────
const app  = express();
const PORT = parseInt(process.env.PORT) || 5001;

// Trust proxy if behind Nginx/load-balancer
app.set('trust proxy', 1);

// ── Security middleware ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost or local network IP (192.168.x.x, 172.x.x.x, 10.x.x.x)
    const allowed = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/172\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    ];
    const ok = allowed.some(re => re.test(origin));
    if (ok) return callback(null, true);
    // Also allow the explicit FRONTEND_URL from .env
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many auth attempts. Please wait 15 minutes.' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many OTP requests. Please wait 10 minutes.' },
});

app.use(globalLimiter);
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/phone/send-otp',  otpLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(compression());

// ── HTTP logger ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Passport — Google OAuth strategy (graceful if not configured) ──
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleConfigured = googleClientId && !googleClientId.includes('NOT_SET');

if (googleConfigured) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;
      const name   = profile.displayName;

      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);

      if (!user && email) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      }

      if (!user) {
        // Create new user
        const id = uuid();
        db.prepare(`
          INSERT INTO users (id, name, email, google_id, avatar, is_verified)
          VALUES (?, ?, ?, ?, ?, 1)
        `).run(id, name, email || null, profile.id, avatar || null);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      } else if (!user.google_id) {
        // Link Google to existing account
        db.prepare('UPDATE users SET google_id = ?, avatar = ?, is_verified = 1 WHERE id = ?')
          .run(profile.id, avatar, user.id);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
  ));
} else {
  console.log('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID in .env to enable it.');
}

app.use(passport.initialize());

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    uptime:    Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin',    adminRouter);
app.use('/api',          ordersRouter); // handles /api/orders, /api/wishlist, /api/wholesale, /api/newsletter

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler (MUST be last) ──────────────────────
app.use(errorHandler);

const LOCAL_IP = '172.26.89.96'; // your Mac's local IP — update if it changes
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌿  Taanavana Backend is RUNNING`);
  console.log(`🔗  Local:   http://localhost:${PORT}`);
  console.log(`🔗  Network: http://${LOCAL_IP}:${PORT}  ← use this on phone/other laptop`);
  console.log(`📋  Health:  http://localhost:${PORT}/health`);
  console.log(`📦  Env:     ${process.env.NODE_ENV || 'development'}\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`\n⚠️   ${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('✅  HTTP server closed. Bye!');
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => { console.error('💥  Forcing exit.'); process.exit(1); }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = app; // for testing
