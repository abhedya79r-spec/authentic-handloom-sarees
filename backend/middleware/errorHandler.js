// ============================================================
//  middleware/errorHandler.js — Global Error Handler
//  Catches every thrown error so the server NEVER crashes.
// ============================================================

'use strict';

/**
 * Operational error wrapper — use for known, expected errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware (must have 4 params).
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Always log the error server-side
  if (statusCode >= 500) {
    console.error('💥 Server Error:', {
      message: err.message,
      stack:   isProduction ? '[hidden in production]' : err.stack,
      path:    req.path,
      method:  req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error:   err.isOperational ? err.message : 'Something went wrong. Please try again.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * Wraps an async route handler so errors are forwarded to errorHandler.
 * Usage: router.get('/path', asyncWrap(async (req, res) => { ... }))
 */
function asyncWrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { AppError, errorHandler, asyncWrap };
