// ============================================================
//  routes/products.js
// ============================================================
'use strict';

const express = require('express');
const router  = express.Router();
const { getDb }              = require('../db/init');
const { asyncWrap, AppError } = require('../middleware/errorHandler');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');

/** GET /api/products — list with optional filter/sort */
router.get('/', optionalAuth, asyncWrap(async (req, res) => {
  const { category, material, min_price, max_price, sort, q } = req.query;
  const db = getDb();

  let sql    = 'SELECT * FROM products WHERE is_active = 1';
  const args = [];

  if (category && category !== 'all') { sql += ' AND category = ?';   args.push(category); }
  if (material && material !== 'all') { sql += ' AND material = ?';   args.push(material); }
  if (min_price) { sql += ' AND price >= ?'; args.push(parseFloat(min_price)); }
  if (max_price) { sql += ' AND price <= ?'; args.push(parseFloat(max_price)); }
  if (q)         { sql += ' AND (name LIKE ? OR description LIKE ?)'; args.push(`%${q}%`, `%${q}%`); }

  const sortMap = {
    'price-low':  'price ASC',
    'price-high': 'price DESC',
    'newest':     'id DESC',
    'rating':     'rating DESC',
    'featured':   'id ASC',
  };
  sql += ` ORDER BY ${sortMap[sort] || 'id ASC'}`;

  const products = db.prepare(sql).all(...args);
  res.json({ success: true, count: products.length, products });
}));

/** GET /api/products/:id */
router.get('/:id', asyncWrap(async (req, res, next) => {
  const db      = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));
  res.json({ success: true, product });
}));

/** POST /api/products — admin only */
router.post('/', requireAuth, requireRole('admin'), asyncWrap(async (req, res) => {
  const { name, price, original_price, category, material, rating, image, badge, description, stock } = req.body;
  const db = getDb();
  const r  = db.prepare(`
    INSERT INTO products (name, price, original_price, category, material, rating, image, badge, description, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, price, original_price, category, material, rating || 4.0, image, badge, description, stock || 100);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json({ success: true, product });
}));

/** PATCH /api/products/:id — admin only */
router.patch('/:id', requireAuth, requireRole('admin'), asyncWrap(async (req, res, next) => {
  const db      = getDb();
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));

  const fields  = ['name','price','original_price','category','material','rating','image','badge','description','stock','is_active'];
  const updates = [];
  const args    = [];

  fields.forEach(f => {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); args.push(req.body[f]); }
  });
  if (!updates.length) return next(new AppError('No fields to update.', 400));

  args.push(req.params.id);
  db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...args);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ success: true, product: updated });
}));

module.exports = router;
