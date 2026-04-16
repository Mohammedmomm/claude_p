const router = require('express').Router();
const auth   = require('../middleware/auth');
const { v4: uuid } = require('uuid');

// GET /api/orders
router.get('/', auth, (req, res) => {
  const orders = req.app.locals.orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', auth, (req, res) => {
  const order = req.app.locals.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

// POST /api/orders
router.post('/', auth, (req, res) => {
  const { paymentMethod = 'card', cardName = '', shippingAddress = {} } = req.body;
  const cartItems = req.app.locals.carts[req.user.id] || [];
  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  const products = req.app.locals.products;
  const items = cartItems.map(item => {
    const p = products.find(pr => pr.id === item.productId);
    if (!p) return null;
    const price = item.isWholesale && p.wholesalePrice ? p.wholesalePrice : p.price;
    return { productId: item.productId, nameEn: p.nameEn, nameAr: p.nameAr, image: p.image, quantity: item.quantity, price, isWholesale: item.isWholesale };
  }).filter(Boolean);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const order = {
    id: uuid(),
    userId: req.user.id,
    items,
    total: +total.toFixed(2),
    paymentMethod,
    cardName,
    shippingAddress,
    status: 'processing',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  };

  req.app.locals.orders.push(order);
  req.app.locals.carts[req.user.id] = [];

  res.status(201).json({ order });
});

module.exports = router;
