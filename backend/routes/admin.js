// ============================================================
//  routes/admin.js — Admin Dashboard API
//  All routes require: requireAuth + requireRole('admin')
// ============================================================

'use strict';

const express      = require('express');
const router       = express.Router();
const { getDb }    = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const adminOnly = [requireAuth, requireRole('admin')];

// ── GET /api/admin/stats — Dashboard overview ─────────────────
router.get('/stats', ...adminOnly, (req, res) => {
  const db = getDb();

  const totalUsers      = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const totalOrders     = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const totalProducts   = db.prepare("SELECT COUNT(*) as c FROM products WHERE is_active=1").get().c;
  const totalRevenue    = db.prepare("SELECT COALESCE(SUM(total),0) as r FROM orders WHERE status != 'cancelled'").get().r;
  const pendingOrders   = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get().c;
  const completedOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='completed'").get().c;
  const newsletterSubs  = db.prepare("SELECT COUNT(*) as c FROM newsletter WHERE subscribed=1").get().c;
  const wholesaleNew    = db.prepare("SELECT COUNT(*) as c FROM wholesale_inquiries WHERE status='new'").get().c;
  const lowStock        = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock < 10 AND is_active=1").get().c;

  // Revenue last 7 days
  const revenueWeek = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as revenue
    FROM orders WHERE status != 'cancelled'
      AND created_at >= datetime('now','-7 days')
    GROUP BY day ORDER BY day
  `).all();

  // Orders by status
  const ordersByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `).all();

  // Top selling products
  const topProducts = db.prepare(`
    SELECT p.id, p.name, p.price, p.category,
           COALESCE(SUM(oi.qty),0) as units_sold,
           COALESCE(SUM(oi.qty * oi.price),0) as revenue
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id ORDER BY units_sold DESC LIMIT 5
  `).all();

  // Recent orders
  const recentOrders = db.prepare(`
    SELECT o.id, o.total, o.status, o.created_at,
           u.name as customer_name, u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers, totalOrders, totalProducts,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        pendingOrders, completedOrders, newsletterSubs,
        wholesaleNew, lowStock
      },
      revenueWeek,
      ordersByStatus,
      topProducts,
      recentOrders
    }
  });
});

// ── GET /api/admin/users — List all users ────────────────────
router.get('/users', ...adminOnly, (req, res) => {
  const db = getDb();
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const where = search
    ? `WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?`
    : '';
  const params = search
    ? [`%${search}%`, `%${search}%`, `%${search}%`]
    : [];

  const total = db.prepare(`SELECT COUNT(*) as c FROM users ${where}`).get(...params).c;
  const users = db.prepare(`
    SELECT id, name, email, phone, role, is_verified, created_at,
           (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
    FROM users ${where}
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ success: true, data: { users, total, page, limit } });
});

// ── PATCH /api/admin/users/:id/role — Change user role ───────
router.patch('/users/:id/role', ...adminOnly, (req, res) => {
  const { role } = req.body;
  if (!['admin','customer'].includes(role)) {
    throw new AppError('Invalid role. Use "admin" or "customer".', 400);
  }
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  res.json({ success: true, message: `User role updated to ${role}` });
});

// ── DELETE /api/admin/users/:id — Delete a user ───────────────
router.delete('/users/:id', ...adminOnly, (req, res) => {
  const db = getDb();
  if (req.params.id === req.user.id) {
    throw new AppError('You cannot delete your own admin account.', 400);
  }
  const info = db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  if (!info.changes) throw new AppError('User not found.', 404);
  res.json({ success: true, message: 'User deleted successfully.' });
});

// ── GET /api/admin/products — List all products ───────────────
router.get('/products', ...adminOnly, (req, res) => {
  const db = getDb();
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 20);
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const where = search ? `WHERE name LIKE ? OR category LIKE ?` : '';
  const params = search ? [`%${search}%`, `%${search}%`] : [];

  const total = db.prepare(`SELECT COUNT(*) as c FROM products ${where}`).get(...params).c;
  const products = db.prepare(`
    SELECT * FROM products ${where}
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ success: true, data: { products, total, page, limit } });
});

// ── POST /api/admin/products — Create product ─────────────────
router.post('/products', ...adminOnly, (req, res) => {
  const { name, price, original_price, category, material, description, image, badge, stock } = req.body;
  if (!name || !price || !category) {
    throw new AppError('name, price and category are required.', 400);
  }
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO products (name, price, original_price, category, material, description, image, badge, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, price, original_price||null, category, material||null, description||null, image||null, badge||null, stock||100);
  res.status(201).json({ success: true, data: { id: info.lastInsertRowid } });
});

// ── PATCH /api/admin/products/:id — Update product ───────────
router.patch('/products/:id', ...adminOnly, (req, res) => {
  const db = getDb();
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) throw new AppError('Product not found.', 404);

  const fields = ['name','price','original_price','category','material','description','image','badge','stock','is_active'];
  const updates = [];
  const vals = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  });
  if (!updates.length) throw new AppError('No fields to update.', 400);
  vals.push(req.params.id);
  db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id=?`).run(...vals);
  res.json({ success: true, message: 'Product updated.' });
});

// ── DELETE /api/admin/products/:id — Delete product ──────────
router.delete('/products/:id', ...adminOnly, (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  if (!info.changes) throw new AppError('Product not found.', 404);
  res.json({ success: true, message: 'Product deleted.' });
});

// ── GET /api/admin/orders — List all orders ───────────────────
router.get('/orders', ...adminOnly, (req, res) => {
  const db = getDb();
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 20);
  const status = req.query.status || '';
  const offset = (page - 1) * limit;

  const where = status ? `WHERE o.status = ?` : '';
  const params = status ? [status] : [];

  const total = db.prepare(`SELECT COUNT(*) as c FROM orders o ${where}`).get(...params).c;
  const orders = db.prepare(`
    SELECT o.id, o.total, o.status, o.payment_method, o.address_json, o.created_at,
           u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${where}
    ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ success: true, data: { orders, total, page, limit } });
});

// ── PATCH /api/admin/orders/:id/status — Update order status ─
router.patch('/orders/:id/status', ...adminOnly, (req, res) => {
  const { status } = req.body;
  const valid = ['pending','processing','shipped','completed','cancelled'];
  if (!valid.includes(status)) {
    throw new AppError(`Status must be one of: ${valid.join(', ')}`, 400);
  }
  const db = getDb();
  const info = db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
  if (!info.changes) throw new AppError('Order not found.', 404);
  res.json({ success: true, message: `Order status updated to ${status}` });
});

// ── GET /api/admin/wholesale — Wholesale inquiries ───────────
router.get('/wholesale', ...adminOnly, (req, res) => {
  const db = getDb();
  const inquiries = db.prepare(`
    SELECT * FROM wholesale_inquiries ORDER BY created_at DESC LIMIT 50
  `).all();
  res.json({ success: true, data: inquiries });
});

// ── PATCH /api/admin/wholesale/:id — Update inquiry status ───
router.patch('/wholesale/:id', ...adminOnly, (req, res) => {
  const { status } = req.body;
  const valid = ['new','contacted','closed'];
  if (!valid.includes(status)) throw new AppError('Invalid status.', 400);
  const db = getDb();
  db.prepare('UPDATE wholesale_inquiries SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ success: true, message: 'Inquiry updated.' });
});

// ── GET /api/admin/newsletter — Newsletter subscribers ───────
router.get('/newsletter', ...adminOnly, (req, res) => {
  const db = getDb();
  const subs = db.prepare(`
    SELECT * FROM newsletter ORDER BY created_at DESC LIMIT 100
  `).all();
  res.json({ success: true, data: subs });
});

// ── POST /api/admin/seed — Seed demo admin user ───────────────
router.post('/seed', (req, res) => {
  const db = getDb();
  const { v4: uuid } = require('uuid');
  const bcrypt = require('bcryptjs');
  const existing = db.prepare("SELECT id FROM users WHERE email='admin@traditionwear.com'").get();
  if (existing) {
    return res.json({ success: true, message: 'Admin user already exists.' });
  }
  const hash = bcrypt.hashSync('Admin@1234', 10);
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, is_verified)
    VALUES (?, ?, ?, ?, 'admin', 1)
  `).run(uuid(), 'Admin', 'admin@traditionwear.com', hash);
  res.json({ success: true, message: 'Admin user created. Email: admin@traditionwear.com | Pass: Admin@1234' });
});

module.exports = router;
