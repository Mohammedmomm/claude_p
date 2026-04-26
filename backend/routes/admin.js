const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [users, products, orders, messages, revenue] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users`),
      pool.query(`SELECT COUNT(*) FROM products`),
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COUNT(*) FROM messages`),
      pool.query(`SELECT COALESCE(SUM(total),0) AS total FROM orders`),
    ]);
    const byRole = await pool.query(`SELECT role, COUNT(*) FROM users GROUP BY role`);
    const roleMap = {};
    byRole.rows.forEach(r => { roleMap[r.role] = +r.count; });
    res.json({
      users: +users.rows[0].count,
      products: +products.rows[0].count,
      orders: +orders.rows[0].count,
      messages: +messages.rows[0].count,
      revenue: +revenue.rows[0].total,
      buyers: roleMap.buyer || 0,
      sellers: roleMap.seller || 0,
    });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ users: rows.map(u => ({ ...u, createdAt: u.created_at })) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await pool.query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/products
router.get('/products', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS seller_name FROM products p LEFT JOIN users u ON u.id=p.seller_id ORDER BY p.created_at DESC`
    );
    res.json({ products: rows });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query(`DELETE FROM products WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/orders
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`
    );
    res.json({ orders: rows });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
