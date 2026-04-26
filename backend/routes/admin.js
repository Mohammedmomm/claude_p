const router = require('express').Router();
const auth   = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, (req, res) => {
  const { users, products, orders, messages, carts } = req.app.locals;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  res.json({
    users:    users.length,
    products: products.length,
    orders:   orders.length,
    messages: messages.length,
    revenue:  totalRevenue,
    buyers:   users.filter(u => u.role === 'buyer').length,
    sellers:  users.filter(u => u.role === 'seller').length,
  });
});

// GET /api/admin/users
router.get('/users', auth, adminOnly, (req, res) => {
  const users = req.app.locals.users.map(u => ({
    id: u.id, name: u.name, email: u.email,
    role: u.role, phone: u.phone || '', createdAt: u.createdAt,
  }));
  res.json({ users });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  req.app.locals.users = req.app.locals.users.filter(u => u.id !== id);
  res.json({ message: 'User deleted' });
});

// GET /api/admin/products
router.get('/products', auth, adminOnly, (req, res) => {
  res.json({ products: req.app.locals.products });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', auth, adminOnly, (req, res) => {
  req.app.locals.products = req.app.locals.products.filter(p => p.id !== req.params.id);
  res.json({ message: 'Product deleted' });
});

// GET /api/admin/orders
router.get('/orders', auth, adminOnly, (req, res) => {
  res.json({ orders: req.app.locals.orders });
});

module.exports = router;
