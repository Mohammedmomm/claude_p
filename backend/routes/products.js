const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

function buildImg(category, firstLetter) {
  const map = { Electronics:['#3b82f6','📱'], Clothing:['#ec4899','👕'], Food:['#22c55e','🍎'], Home:['#f59e0b','🏠'], Sports:['#ef4444','⚽'], Books:['#8b5cf6','📚'], Beauty:['#f472b6','💄'] };
  const [color, emoji] = map[category] || ['#64748b','📦'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}" opacity="0.7" rx="20"/><text x="200" y="220" text-anchor="middle" dominant-baseline="middle" font-size="120" font-family="system-ui">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const fmt = (p) => ({
  id: p.id, nameEn: p.name_en, nameAr: p.name_ar, descEn: p.desc_en, descAr: p.desc_ar,
  category: p.category, price: +p.price, stock: p.stock, image: p.image,
  sellerId: p.seller_id, isWholesale: p.is_wholesale,
  wholesalePrice: p.wholesale_price ? +p.wholesale_price : null,
  wholesaleMinParticipants: p.wholesale_min_participants,
  wholesaleDeadline: p.wholesale_deadline,
  featured: p.is_featured, tags: p.tags || [], rating: +p.rating,
  createdAt: p.created_at,
  seller: p.seller_name ? { id: p.seller_id, name: p.seller_name, phone: p.seller_phone, role: p.seller_role } : null,
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sellerId, page = 1, limit = 12 } = req.query;
    const conds = []; const vals = [];
    if (category && category !== 'All') { conds.push(`p.category=$${vals.length+1}`); vals.push(category); }
    if (featured === 'true') { conds.push(`p.is_featured=true`); }
    if (sellerId) { conds.push(`p.seller_id=$${vals.length+1}`); vals.push(sellerId); }
    if (search) {
      conds.push(`(p.name_en ILIKE $${vals.length+1} OR p.name_ar ILIKE $${vals.length+1} OR p.category ILIKE $${vals.length+1} OR $${vals.length+1} ILIKE ANY(p.tags))`);
      vals.push(`%${search}%`);
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM products p ${where}`, vals);
    const total = +countRes.rows[0].count;
    const offset = (Number(page)-1) * Number(limit);
    vals.push(Number(limit), offset);
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.role AS seller_role
       FROM products p LEFT JOIN users u ON u.id=p.seller_id
       ${where} ORDER BY p.created_at DESC LIMIT $${vals.length-1} OFFSET $${vals.length}`, vals
    );
    res.json({ products: rows.map(fmt), total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/products/categories
router.get('/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT category FROM products ORDER BY category`);
    res.json({ categories: rows.map(r => r.category) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS seller_name, u.phone AS seller_phone, u.role AS seller_role
       FROM products p LEFT JOIN users u ON u.id=p.seller_id WHERE p.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: fmt(rows[0]) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/products
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ error: 'Only sellers can post listings' });
    const { nameEn, nameAr, descEn, descAr, category, price, wholesalePrice, stock, image, isWholesale, wholesaleDuration, wholesaleMinParticipants, tags } = req.body;
    if (!nameEn || !category || !price) return res.status(400).json({ error: 'nameEn, category, price required' });
    const durationMap = { '4h':4*3600000, '1d':86400000, '2d':172800000, '1w':604800000 };
    const deadline = isWholesale && wholesaleDuration ? new Date(Date.now()+(durationMap[wholesaleDuration]||86400000)) : null;
    const finalImage = image || buildImg(category, nameEn[0]);
    const { rows } = await pool.query(
      `INSERT INTO products (name_en,name_ar,desc_en,desc_ar,category,price,wholesale_price,stock,image,seller_id,is_wholesale,wholesale_min_participants,wholesale_deadline,tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [nameEn, nameAr||nameEn, descEn||'', descAr||descEn||'', category, +price, wholesalePrice?+wholesalePrice:null, +stock||10, finalImage, req.user.id, !!isWholesale, +wholesaleMinParticipants||10, deadline, tags||[]]
    );
    res.status(201).json({ product: fmt(rows[0]) });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await pool.query(`SELECT * FROM products WHERE id=$1`, [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Product not found' });
    if (existing[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
    const { nameEn, nameAr, descEn, descAr, price, wholesalePrice, stock, image, isWholesale, wholesaleMinParticipants, tags } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET name_en=COALESCE($1,name_en), name_ar=COALESCE($2,name_ar), desc_en=COALESCE($3,desc_en), desc_ar=COALESCE($4,desc_ar),
       price=COALESCE($5,price), wholesale_price=COALESCE($6,wholesale_price), stock=COALESCE($7,stock), image=COALESCE($8,image),
       is_wholesale=COALESCE($9,is_wholesale), wholesale_min_participants=COALESCE($10,wholesale_min_participants), tags=COALESCE($11,tags)
       WHERE id=$12 RETURNING *`,
      [nameEn||null, nameAr||null, descEn||null, descAr||null, price?+price:null, wholesalePrice?+wholesalePrice:null, stock?+stock:null, image||null, isWholesale??null, wholesaleMinParticipants?+wholesaleMinParticipants:null, tags||null, req.params.id]
    );
    res.json({ product: fmt(rows[0]) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT seller_id FROM products WHERE id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    if (rows[0].seller_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your listing' });
    await pool.query(`DELETE FROM products WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Listing deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/products/:id/boost
router.post('/:id/boost', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT seller_id FROM products WHERE id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    if (rows[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
    await pool.query(`UPDATE products SET is_featured=true WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Listing boosted successfully' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/products/:id/reveal-phone
router.post('/:id/reveal-phone', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.phone FROM products p JOIN users u ON u.id=p.seller_id WHERE p.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json({ phone: rows[0].phone || '+963-11-000-0001' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
