const router = require('express').Router();
const auth   = require('../middleware/auth');

const getCart  = (app, uid) => app.locals.carts[uid] || [];
const setCart  = (app, uid, cart) => { app.locals.carts[uid] = cart; };
const withProduct = (app, item) => {
  const product = app.locals.products.find(p => p.id === item.productId);
  return product ? { ...item, product } : null;
};

// GET /api/cart
router.get('/', auth, (req, res) => {
  const items = getCart(req.app, req.user.id)
    .map(item => withProduct(req.app, item))
    .filter(Boolean);
  res.json({ items });
});

// POST /api/cart/add
router.post('/add', auth, (req, res) => {
  const { productId, quantity = 1, isWholesale = false } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const product = req.app.locals.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let cart = getCart(req.app, req.user.id);
  const idx = cart.findIndex(i => i.productId === productId);

  if (idx >= 0) {
    cart[idx].quantity += Number(quantity);
    cart[idx].isWholesale = isWholesale;
  } else {
    cart.push({ productId, quantity: Number(quantity), isWholesale });
  }
  setCart(req.app, req.user.id, cart);
  res.json({ message: 'Added to cart', items: cart.map(i => withProduct(req.app, i)).filter(Boolean) });
});

// PUT /api/cart/:productId
router.put('/:productId', auth, (req, res) => {
  const { quantity } = req.body;
  let cart = getCart(req.app, req.user.id);
  const idx = cart.findIndex(i => i.productId === req.params.productId);
  if (idx < 0) return res.status(404).json({ error: 'Item not in cart' });
  if (Number(quantity) <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = Number(quantity);
  }
  setCart(req.app, req.user.id, cart);
  res.json({ items: cart.map(i => withProduct(req.app, i)).filter(Boolean) });
});

// DELETE /api/cart/:productId
router.delete('/:productId', auth, (req, res) => {
  let cart = getCart(req.app, req.user.id).filter(i => i.productId !== req.params.productId);
  setCart(req.app, req.user.id, cart);
  res.json({ items: cart.map(i => withProduct(req.app, i)).filter(Boolean) });
});

// DELETE /api/cart  (clear all)
router.delete('/', auth, (req, res) => {
  setCart(req.app, req.user.id, []);
  res.json({ items: [] });
});

module.exports = router;
