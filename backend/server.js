require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');
const auth    = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/chat',     require('./routes/chat'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/admin',    require('./routes/admin'));

// Wishlist
app.get('/api/wishlist', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.* FROM wishlist w JOIN products p ON p.id=w.product_id WHERE w.user_id=$1`, [req.user.id]
    );
    res.json({ items: rows, ids: rows.map(p => p.id) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/wishlist/:productId', auth, async (req, res) => {
  try {
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM wishlist WHERE user_id=$1 AND product_id=$2`, [req.user.id, req.params.productId]
    );
    let added;
    if (existing.length) {
      await pool.query(`DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2`, [req.user.id, req.params.productId]);
      added = false;
    } else {
      await pool.query(`INSERT INTO wishlist (user_id,product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.user.id, req.params.productId]);
      added = true;
    }
    const { rows } = await pool.query(`SELECT product_id FROM wishlist WHERE user_id=$1`, [req.user.id]);
    res.json({ added, ids: rows.map(r => r.product_id) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.get('/', (_, res) => res.json({ message: 'Jumla Wholesale API v2.0 — PostgreSQL', status: 'running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  Jumla API running → http://localhost:${PORT}`));
