// ============================================================
//  db/init.js — SQLite Database Initialization
//  Creates all tables if they don't exist.
//  Uses better-sqlite3 (synchronous, never crashes on async).
// ============================================================

'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const dotenv   = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'taanavana.db');

// Ensure the db directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

/** Singleton database connection */
let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    // Enable WAL mode — dramatically better concurrency & crash recovery
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _db.pragma('synchronous = NORMAL');
  }
  return _db;
}

/** Run all CREATE TABLE statements */
function initDb() {
  const db = getDb();

  db.exec(`
    /* ── Users ─────────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT    PRIMARY KEY,
      name          TEXT,
      email         TEXT    UNIQUE,
      phone         TEXT    UNIQUE,
      password_hash TEXT,
      google_id     TEXT    UNIQUE,
      avatar        TEXT,
      role          TEXT    NOT NULL DEFAULT 'customer',
      lang          TEXT    NOT NULL DEFAULT 'en',
      theme         TEXT    NOT NULL DEFAULT 'light',
      is_verified   INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── OTP Tokens (phone login / password reset) ───── */
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT,
      contact    TEXT    NOT NULL,
      otp        TEXT    NOT NULL,
      purpose    TEXT    NOT NULL DEFAULT 'phone_login',
      expires_at TEXT    NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    /* ── Password Reset Tokens ───────────────────────── */
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT    NOT NULL,
      token      TEXT    NOT NULL UNIQUE,
      expires_at TEXT    NOT NULL,
      used       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    /* ── Products ─────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      name_pa       TEXT,
      price         REAL    NOT NULL,
      original_price REAL,
      category      TEXT    NOT NULL,
      material      TEXT,
      rating        REAL    DEFAULT 4.0,
      reviews_count INTEGER DEFAULT 0,
      image         TEXT,
      badge         TEXT,
      description   TEXT,
      description_pa TEXT,
      stock         INTEGER NOT NULL DEFAULT 100,
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Cart ─────────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS cart (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT    NOT NULL,
      product_id INTEGER NOT NULL,
      qty        INTEGER NOT NULL DEFAULT 1,
      added_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    /* ── Wishlist ──────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS wishlist (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    TEXT    NOT NULL,
      product_id INTEGER NOT NULL,
      added_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    /* ── Orders ───────────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS orders (
      id             TEXT    PRIMARY KEY,
      user_id        TEXT    NOT NULL,
      total          REAL    NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'pending',
      address_json   TEXT,
      payment_method TEXT,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    /* ── Order Items ──────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   TEXT    NOT NULL,
      product_id INTEGER NOT NULL,
      qty        INTEGER NOT NULL,
      price      REAL    NOT NULL,
      FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    /* ── Wholesale Inquiries ──────────────────────────── */
    CREATE TABLE IF NOT EXISTS wholesale_inquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      phone      TEXT,
      interest   TEXT,
      message    TEXT,
      status     TEXT    NOT NULL DEFAULT 'new',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Newsletter ───────────────────────────────────── */
    CREATE TABLE IF NOT EXISTS newsletter (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    NOT NULL UNIQUE,
      subscribed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Indexes ──────────────────────────────────────── */
    CREATE INDEX IF NOT EXISTS idx_otp_contact    ON otp_tokens(contact);
    CREATE INDEX IF NOT EXISTS idx_reset_token    ON reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_cart_user      ON cart(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user  ON wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user    ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_cat   ON products(category);
  `);

  console.log('✅  Database initialized at:', DB_PATH);
  return db;
}

module.exports = { getDb, initDb };
