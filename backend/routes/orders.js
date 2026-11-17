// ============================================================
//  routes/orders.js + routes/misc.js (wishlist, wholesale, newsletter)
// ============================================================
'use strict';

const express  = require('express');
const router   = express.Router();
const { v4: uuid } = require('uuid');
const { getDb }              = require('../db/init');
const { asyncWrap, AppError } = require('../middleware/errorHandler');
const { requireAuth }        = require('../middleware/auth');

/* ── ORDERS ─────────────────────────────────────────────────── */

/** POST /api/orders — place order from cart */
router.post('/', requireAuth, asyncWrap(async (req, res, next) => {
  const { address, payment_method = 'cod' } = req.body;
  const db    = getDb();
  const items = db.prepare(`
    SELECT c.qty, p.id as product_id, p.price, p.stock
    FROM cart c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `).all(req.user.id);

  if (!items.length) return next(new AppError('Your cart is empty.', 400));

  // Check stock
  for (const item of items) {
    if (item.qty > item.stock) {
      return next(new AppError(`Insufficient stock for one or more items.`, 400));
    }
  }

  const total   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const orderId = uuid();

  // Insert order + items atomically
  const placeOrder = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, user_id, total, address_json, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `).run(orderId, req.user.id, total, JSON.stringify(address || {}), payment_method);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)
    `);
    const deductStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.qty, item.price);
      deductStock.run(item.qty, item.product_id);
    }

    // Clear cart after order
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
  });

  placeOrder();
  res.status(201).json({ success: true, order_id: orderId, total });
}));

/** GET /api/orders — user's orders */
router.get('/', requireAuth, asyncWrap(async (req, res) => {
  const db     = getDb();
  const orders = db.prepare(`
    SELECT o.id, o.total, o.status, o.payment_method, o.created_at,
           COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json({ success: true, orders });
}));

/** GET /api/orders/:id */
router.get('/:id', requireAuth, asyncWrap(async (req, res, next) => {
  const db    = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return next(new AppError('Order not found.', 404));

  const items = db.prepare(`
    SELECT oi.qty, oi.price, p.name, p.image
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({ success: true, order: { ...order, items } });
}));

/* ── WISHLIST ───────────────────────────────────────────────── */

router.get('/wishlist', requireAuth, asyncWrap(async (req, res) => {
  const db    = getDb();
  const items = db.prepare(`
    SELECT p.id, p.name, p.price, p.image, p.rating
    FROM wishlist w JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ?
  `).all(req.user.id);
  res.json({ success: true, items });
}));

router.post('/wishlist', requireAuth, asyncWrap(async (req, res, next) => {
  const { product_id } = req.body;
  const db = getDb();
  const p  = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
  if (!p) return next(new AppError('Product not found.', 404));

  const exists = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (exists) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(exists.id);
    return res.json({ success: true, action: 'removed' });
  }
  db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
  res.json({ success: true, action: 'added' });
}));

/* ── WHOLESALE INQUIRY ──────────────────────────────────────── */

router.post('/wholesale', asyncWrap(async (req, res) => {
  const { name, email, phone, interest, message } = req.body;
  if (!name || !email) throw new AppError('Name and email are required.', 400);
  getDb().prepare(`
    INSERT INTO wholesale_inquiries (name, email, phone, interest, message) VALUES (?, ?, ?, ?, ?)
  `).run(name, email, phone || null, interest || null, message || null);
  res.json({ success: true, message: 'Your inquiry has been submitted. We will contact you within 24 hours.' });
}));

/* ── NEWSLETTER ─────────────────────────────────────────────── */

router.post('/newsletter', asyncWrap(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('Valid email required.', 400);
  }
  const db = getDb();
  const existing = db.prepare('SELECT id, subscribed FROM newsletter WHERE email = ?').get(email);
  if (existing) {
    if (existing.subscribed) return res.json({ success: true, message: 'You are already subscribed!' });
    db.prepare('UPDATE newsletter SET subscribed = 1 WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email);
  }
  res.json({ success: true, message: 'Subscribed successfully! Welcome to the Taanavana family.' });
}));

module.exports = router;
