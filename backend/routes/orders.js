const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

// GET /api/orders
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]
    );
    res.json({ orders: rows.map(o => ({ ...o, createdAt: o.created_at })) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: { ...rows[0], createdAt: rows[0].created_at } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/orders
router.post('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { paymentMethod = 'card', cardName = '', shippingAddress = {} } = req.body;

    const { rows: cartRows } = await client.query(
      `SELECT c.quantity, c.is_wholesale, p.id, p.name_en, p.name_ar, p.image, p.price, p.wholesale_price, p.stock
       FROM carts c JOIN products p ON p.id=c.product_id WHERE c.user_id=$1`, [req.user.id]
    );
    if (!cartRows.length) return res.status(400).json({ error: 'Cart is empty' });

    const items = cartRows.map(r => {
      const price = r.is_wholesale && r.wholesale_price ? +r.wholesale_price : +r.price;
      return { productId: r.id, nameEn: r.name_en, nameAr: r.name_ar, image: r.image, quantity: r.quantity, price, isWholesale: r.is_wholesale };
    });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const { rows } = await client.query(
      `INSERT INTO orders (user_id,items,total,status) VALUES ($1,$2,$3,'processing') RETURNING *`,
      [req.user.id, JSON.stringify(items), +total.toFixed(2)]
    );
    await client.query(`DELETE FROM carts WHERE user_id=$1`, [req.user.id]);
    await client.query('COMMIT');

    res.status(201).json({
      order: {
        ...rows[0], createdAt: rows[0].created_at,
        paymentMethod, cardName, shippingAddress,
        estimatedDelivery: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      }
    });
  } catch(e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally { client.release(); }
});

module.exports = router;
