// ============================================================
//  middleware/auth.js — JWT Authentication Middleware
// ============================================================

'use strict';

const jwt      = require('jsonwebtoken');
const { getDb } = require('../db/init');
const { AppError } = require('./errorHandler');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches req.user = { id, email, role, ... } on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally check the user still exists in DB
    const db   = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, lang, theme FROM users WHERE id = ?')
                   .get(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
}

/**
 * Optional auth — attaches req.user if token is present but doesn't block.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db   = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, lang, theme FROM users WHERE id = ?')
                   .get(decoded.id);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

/** Restrict to specific roles, e.g. requireRole('admin') */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

/** Issue a signed JWT for a user */
function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { requireAuth, optionalAuth, requireRole, signToken };
