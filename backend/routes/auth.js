// ============================================================
//  routes/auth.js — Authentication Routes
//
//  POST /api/auth/register        — email + password
//  POST /api/auth/login           — email + password
//  POST /api/auth/phone/send-otp  — send OTP to phone
//  POST /api/auth/phone/verify    — verify phone OTP → JWT
//  POST /api/auth/forgot-password — send reset email
//  POST /api/auth/reset-password  — reset with token
//  GET  /api/auth/google          — start Google OAuth
//  GET  /api/auth/google/callback — Google OAuth callback
//  GET  /api/auth/me              — get current user
//  POST /api/auth/logout          — invalidate (client-side)
//  PATCH /api/auth/preferences    — save lang/theme
// ============================================================

'use strict';

const express      = require('express');
const router       = express.Router();
const bcrypt       = require('bcryptjs');
const { v4: uuid } = require('uuid');
const nodemailer   = require('nodemailer');
const { body, validationResult } = require('express-validator');
const passport     = require('passport');

const { getDb }                           = require('../db/init');
const { AppError, asyncWrap }             = require('../middleware/errorHandler');
const { requireAuth, signToken }          = require('../middleware/auth');

// ── Helpers ──────────────────────────────────────────────────

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpExpiry(minutes = 10) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

/** Send email via Nodemailer (gracefully fails if not configured) */
async function sendMail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured. Skipping send.', { to, subject });
    return;
  }
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

// ── Validation helpers ────────────────────────────────────────

function handleValidation(req, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join('. ');
    next(new AppError(msg, 400));
    return false;
  }
  return true;
}

// ── Routes ────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { name, email, password } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return next(new AppError('An account with this email already exists.', 409));

    const hash = await bcrypt.hash(password, 12);
    const id   = uuid();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, is_verified)
      VALUES (?, ?, ?, ?, 0)
    `).run(id, name, email, hash);

    const token = signToken(id);
    const user  = db.prepare('SELECT id, name, email, role, lang, theme FROM users WHERE id = ?').get(id);

    res.status(201).json({ success: true, token, user });
  })
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { email, password } = req.body;
    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !user.password_hash) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return next(new AppError('Invalid email or password.', 401));

    const token    = signToken(user.id);
    const { password_hash, google_id, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  })
);

/**
 * POST /api/auth/phone/send-otp
 * Body: { phone }  — phone must be a 10-digit Indian number
 */
router.post('/phone/send-otp',
  body('phone').matches(/^\+?[0-9]{10,13}$/).withMessage('Invalid phone number'),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { phone } = req.body;
    const db  = getDb();
    const otp = generateOTP();
    const exp = otpExpiry(parseInt(process.env.OTP_EXPIRES_MINUTES) || 10);

    // Invalidate previous OTPs for this number
    db.prepare(`UPDATE otp_tokens SET used = 1 WHERE contact = ? AND purpose = 'phone_login'`).run(phone);

    // Insert new OTP (not linked to user yet — user may not exist)
    db.prepare(`
      INSERT INTO otp_tokens (contact, otp, purpose, expires_at)
      VALUES (?, ?, 'phone_login', ?)
    `).run(phone, otp, exp);

    // In production: send SMS via Twilio / AWS SNS
    // For now: log to console (safe for dev)
    console.log(`📱  OTP for ${phone}: ${otp}  (expires: ${exp})`);

    res.json({
      success: true,
      message: 'OTP sent to your phone number.',
      // ⚠️  Remove this in production — only for dev testing:
      dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  })
);

/**
 * POST /api/auth/phone/verify
 * Body: { phone, otp, name? }
 */
router.post('/phone/verify',
  body('phone').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { phone, otp, name } = req.body;
    const db  = getDb();
    const now = new Date().toISOString();

    const record = db.prepare(`
      SELECT * FROM otp_tokens
      WHERE contact = ? AND otp = ? AND purpose = 'phone_login'
        AND used = 0 AND expires_at > ?
      ORDER BY id DESC LIMIT 1
    `).get(phone, otp, now);

    if (!record) return next(new AppError('Invalid or expired OTP. Please try again.', 400));

    // Mark OTP as used
    db.prepare('UPDATE otp_tokens SET used = 1 WHERE id = ?').run(record.id);

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      const id = uuid();
      db.prepare(`
        INSERT INTO users (id, name, phone, is_verified) VALUES (?, ?, ?, 1)
      `).run(id, name || 'Taanavana User', phone);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else if (!user.is_verified) {
      db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(user.id);
    }

    const token = signToken(user.id);
    const { password_hash, google_id, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  })
);

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { email } = req.body;
    const db   = getDb();
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email);

    // Always respond success (don't reveal if email exists)
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const token   = uuid();
    const expires = otpExpiry(60); // 60 minutes

    db.prepare(`INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`)
      .run(user.id, token, expires);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    await sendMail({
      to:      email,
      subject: 'Reset your Taanavana password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;">
          <h2 style="color:#C45B3F;">Taanavana — Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#C45B3F;color:#fff;border-radius:50px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="margin-top:16px;font-size:0.85rem;color:#666;">
            This link expires in 60 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  })
);

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  asyncWrap(async (req, res, next) => {
    if (!handleValidation(req, next)) return;

    const { token, password } = req.body;
    const db  = getDb();
    const now = new Date().toISOString();

    const record = db.prepare(`
      SELECT * FROM reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?
    `).get(token, now);

    if (!record) return next(new AppError('Invalid or expired reset link. Please request a new one.', 400));

    const hash = await bcrypt.hash(password, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, record.user_id);
    db.prepare('UPDATE reset_tokens SET used = 1 WHERE id = ?').run(record.id);

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  })
);

// ── Google OAuth ──────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Redirects user to Google consent screen.
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * GET /api/auth/google/callback
 * Google redirects here after consent.
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/?auth=failed` }),
  (req, res) => {
    // req.user is set by passport strategy
    const token = signToken(req.user.id);
    // Redirect to frontend with token in query (frontend picks it up)
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}&auth=google`);
  }
);

// ── Protected Routes ──────────────────────────────────────────

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/auth/logout
 * JWT is stateless — client just deletes the token.
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * PATCH /api/auth/preferences
 * Body: { lang?, theme? }
 */
router.patch('/preferences', requireAuth, asyncWrap(async (req, res) => {
  const { lang, theme } = req.body;
  const db = getDb();

  if (lang)  db.prepare('UPDATE users SET lang  = ? WHERE id = ?').run(lang,  req.user.id);
  if (theme) db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, req.user.id);

  const user = db.prepare('SELECT id, name, email, phone, role, lang, theme FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, user });
}));

module.exports = router;
