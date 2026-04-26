const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

// GET /api/cart
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.quantity, c.is_wholesale,
              p.id, p.name_en, p.name_ar, p.price, p.wholesale_price, p.image, p.stock, p.category
       FROM carts c JOIN products p ON p.id=c.product_id
       WHERE c.user_id=$1`, [req.user.id]
    );
    const items = rows.map(r => ({
      productId: r.id, quantity: r.quantity, isWholesale: r.is_wholesale,
      product: { id:r.id, nameEn:r.name_en, nameAr:r.name_ar, price:+r.price, wholesalePrice:r.wholesale_price?+r.wholesale_price:null, image:r.image, stock:r.stock, category:r.category }
    }));
    res.json({ items });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/cart/add
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, isWholesale = false } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });
    const { rows: prod } = await pool.query(`SELECT id FROM products WHERE id=$1`, [productId]);
    if (!prod[0]) return res.status(404).json({ error: 'Product not found' });
    await pool.query(
      `INSERT INTO carts (user_id,product_id,quantity,is_wholesale) VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id,product_id) DO UPDATE SET quantity=carts.quantity+$3, is_wholesale=$4`,
      [req.user.id, productId, +quantity, isWholesale]
    );
    const { rows } = await pool.query(
      `SELECT c.quantity, c.is_wholesale, p.id, p.name_en, p.name_ar, p.price, p.wholesale_price, p.image, p.stock, p.category
       FROM carts c JOIN products p ON p.id=c.product_id WHERE c.user_id=$1`, [req.user.id]
    );
    const items = rows.map(r => ({
      productId: r.id, quantity: r.quantity, isWholesale: r.is_wholesale,
      product: { id:r.id, nameEn:r.name_en, nameAr:r.name_ar, price:+r.price, wholesalePrice:r.wholesale_price?+r.wholesale_price:null, image:r.image, stock:r.stock, category:r.category }
    }));
    res.json({ message: 'Added to cart', items });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/cart/:productId
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (Number(quantity) <= 0) {
      await pool.query(`DELETE FROM carts WHERE user_id=$1 AND product_id=$2`, [req.user.id, req.params.productId]);
    } else {
      await pool.query(`UPDATE carts SET quantity=$1 WHERE user_id=$2 AND product_id=$3`, [+quantity, req.user.id, req.params.productId]);
    }
    const { rows } = await pool.query(
      `SELECT c.quantity, c.is_wholesale, p.id, p.name_en, p.name_ar, p.price, p.wholesale_price, p.image, p.stock, p.category
       FROM carts c JOIN products p ON p.id=c.product_id WHERE c.user_id=$1`, [req.user.id]
    );
    const items = rows.map(r => ({
      productId: r.id, quantity: r.quantity, isWholesale: r.is_wholesale,
      product: { id:r.id, nameEn:r.name_en, nameAr:r.name_ar, price:+r.price, wholesalePrice:r.wholesale_price?+r.wholesale_price:null, image:r.image, stock:r.stock, category:r.category }
    }));
    res.json({ items });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/cart/:productId
router.delete('/:productId', auth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM carts WHERE user_id=$1 AND product_id=$2`, [req.user.id, req.params.productId]);
    const { rows } = await pool.query(
      `SELECT c.quantity, c.is_wholesale, p.id, p.name_en, p.name_ar, p.price, p.wholesale_price, p.image, p.stock, p.category
       FROM carts c JOIN products p ON p.id=c.product_id WHERE c.user_id=$1`, [req.user.id]
    );
    const items = rows.map(r => ({
      productId: r.id, quantity: r.quantity, isWholesale: r.is_wholesale,
      product: { id:r.id, nameEn:r.name_en, nameAr:r.name_ar, price:+r.price, wholesalePrice:r.wholesale_price?+r.wholesale_price:null, image:r.image, stock:r.stock, category:r.category }
    }));
    res.json({ items });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/cart
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM carts WHERE user_id=$1`, [req.user.id]);
    res.json({ items: [] });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
