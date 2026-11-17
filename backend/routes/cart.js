// ============================================================
//  routes/cart.js
// ============================================================
'use strict';

const express = require('express');
const router  = express.Router();
const { getDb }              = require('../db/init');
const { asyncWrap, AppError } = require('../middleware/errorHandler');
const { requireAuth }        = require('../middleware/auth');

/** GET /api/cart */
router.get('/', requireAuth, asyncWrap(async (req, res) => {
  const db   = getDb();
  const items = db.prepare(`
    SELECT c.id, c.qty, p.id as product_id, p.name, p.price, p.image, p.stock
    FROM cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `).all(req.user.id);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  res.json({ success: true, items, total });
}));

/** POST /api/cart — add or increment */
router.post('/', requireAuth, asyncWrap(async (req, res, next) => {
  const { product_id, qty = 1 } = req.body;
  const db = getDb();
  const p  = db.prepare('SELECT id, stock FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!p) return next(new AppError('Product not found.', 404));

  const existing = db.prepare('SELECT id, qty FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  const newQty   = (existing ? existing.qty : 0) + qty;
  if (newQty > p.stock) return next(new AppError('Requested quantity exceeds available stock.', 400));

  if (existing) {
    db.prepare('UPDATE cart SET qty = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)').run(req.user.id, product_id, qty);
  }
  res.json({ success: true, message: 'Cart updated.' });
}));

/** PATCH /api/cart/:productId — set qty */
router.patch('/:productId', requireAuth, asyncWrap(async (req, res, next) => {
  const { qty } = req.body;
  const db = getDb();
  if (qty <= 0) {
    db.prepare('DELETE FROM cart WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  } else {
    db.prepare('UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ?').run(qty, req.user.id, req.params.productId);
  }
  res.json({ success: true });
}));

/** DELETE /api/cart/:productId */
router.delete('/:productId', requireAuth, asyncWrap(async (req, res) => {
  getDb().prepare('DELETE FROM cart WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ success: true });
}));

/** DELETE /api/cart — clear entire cart */
router.delete('/', requireAuth, asyncWrap(async (req, res) => {
  getDb().prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
}));

module.exports = router;
