const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE product_id=$1 ORDER BY created_at DESC`, [req.params.productId]
    );
    res.json({ reviews: rows.map(r => ({ ...r, productId: r.product_id, userId: r.user_id, userName: r.user_name, createdAt: r.created_at })) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ error: 'productId and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const { rows: prod } = await pool.query(`SELECT id FROM products WHERE id=$1`, [productId]);
    if (!prod[0]) return res.status(404).json({ error: 'Product not found' });
    const { rows: user } = await pool.query(`SELECT name FROM users WHERE id=$1`, [req.user.id]);
    const { rows } = await pool.query(
      `INSERT INTO reviews (product_id,user_id,user_name,rating,comment) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [productId, req.user.id, user[0]?.name || 'Anonymous', +rating, comment || '']
    );
    // Update product average rating
    await pool.query(
      `UPDATE products SET rating=(SELECT AVG(rating) FROM reviews WHERE product_id=$1) WHERE id=$1`, [productId]
    );
    const r = rows[0];
    res.status(201).json({ review: { ...r, productId: r.product_id, userId: r.user_id, userName: r.user_name, createdAt: r.created_at } });
  } catch(e) {
    if (e.code === '23505') return res.status(409).json({ error: 'You already reviewed this product' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
