const router = require('express').Router();
const auth   = require('../middleware/auth');
const { v4: uuid } = require('uuid');

// GET /api/reviews/:productId
router.get('/:productId', (req, res) => {
  const reviews = req.app.locals.reviews
    .filter(r => r.productId === req.params.productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reviews });
});

// POST /api/reviews
router.post('/', auth, (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) return res.status(400).json({ error: 'productId and rating required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

  const product = req.app.locals.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = req.app.locals.reviews.find(r => r.productId === productId && r.userId === req.user.id);
  if (existing) return res.status(409).json({ error: 'You already reviewed this product' });

  const user = req.app.locals.users.find(u => u.id === req.user.id);
  const review = {
    id: uuid(),
    productId,
    userId: req.user.id,
    userName: user ? user.name : 'Anonymous',
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };
  req.app.locals.reviews.push(review);

  // Recalculate product rating
  const productReviews = req.app.locals.reviews.filter(r => r.productId === productId);
  product.rating = +(productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1);
  product.reviewCount = productReviews.length;

  res.status(201).json({ review });
});

module.exports = router;
