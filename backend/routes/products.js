const router = require('express').Router();
const auth   = require('../middleware/auth');
const { v4: uuid } = require('uuid');

// GET /api/products
router.get('/', (req, res) => {
  try {
    let items = [...req.app.locals.products];
    const { category, search, featured, sellerId, page = 1, limit = 12 } = req.query;
    if (category && category !== 'All') items = items.filter(p => p.category === category);
    if (featured === 'true') items = items.filter(p => p.featured);
    if (sellerId) items = items.filter(p => p.sellerId === sellerId);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.includes(q))
      );
    }
    const total = items.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = items.slice(start, start + Number(limit));
    res.json({ products: paginated, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const cats = [...new Set(req.app.locals.products.map(p => p.category))];
  res.json({ categories: cats });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = req.app.locals.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Attach seller info
  const seller = req.app.locals.users.find(u => u.id === product.sellerId);
  const productWithSeller = {
    ...product,
    seller: seller ? { id: seller.id, name: seller.name, phone: seller.phone, role: seller.role } : null,
  };
  res.json({ product: productWithSeller });
});

// POST /api/products  — seller creates listing
router.post('/', auth, (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ error: 'Only sellers can post listings' });
    const { nameEn, nameAr, descEn, descAr, category, price, wholesalePrice, stock, image, isWholesale, wholesaleDuration, wholesaleMinParticipants, tags } = req.body;
    if (!nameEn || !category || !price) return res.status(400).json({ error: 'nameEn, category, price required' });

    const categoryColors = { Electronics:'#3b82f6', Clothing:'#ec4899', Food:'#22c55e', Home:'#f59e0b', Sports:'#ef4444', Books:'#8b5cf6', Beauty:'#f472b6' };
    const color = categoryColors[category] || '#64748b';
    const defaultImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}" opacity="0.6" rx="20"/><text x="200" y="220" text-anchor="middle" dominant-baseline="middle" font-size="60" font-family="system-ui" fill="white">${nameEn[0]?.toUpperCase()}</text></svg>`)}`;

    const durationMap = { '4h': 4*60*60*1000, '1d': 24*60*60*1000, '2d': 48*60*60*1000, '1w': 7*24*60*60*1000 };
    const deadline = isWholesale && wholesaleDuration ? new Date(Date.now() + (durationMap[wholesaleDuration] || durationMap['1d'])).toISOString() : null;

    const product = {
      id: uuid(),
      nameEn,
      nameAr: nameAr || nameEn,
      descEn: descEn || '',
      descAr: descAr || descEn || '',
      category,
      price: Number(price),
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      stock: Number(stock) || 10,
      image: image || defaultImage,
      rating: 0,
      reviewCount: 0,
      isWholesale: !!isWholesale,
      wholesaleDeadline: deadline,
      wholesaleCurrentParticipants: 0,
      wholesaleMinParticipants: Number(wholesaleMinParticipants) || 10,
      wholesaleDuration: wholesaleDuration || '1d',
      sellerId: req.user.id,
      tags: tags || [],
      featured: false,
      createdAt: new Date().toISOString(),
    };
    req.app.locals.products.unshift(product);
    res.status(201).json({ product });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/products/:id  — seller edits own listing
router.put('/:id', auth, (req, res) => {
  const product = req.app.locals.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  const allowed = ['nameEn','nameAr','descEn','descAr','price','wholesalePrice','stock','image','isWholesale','wholesaleMinParticipants','tags'];
  allowed.forEach(k => { if (req.body[k] !== undefined) product[k] = req.body[k]; });
  res.json({ product });
});

// DELETE /api/products/:id  — seller deletes own listing
router.delete('/:id', auth, (req, res) => {
  const idx = req.app.locals.products.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Product not found' });
  if (req.app.locals.products[idx].sellerId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  req.app.locals.products.splice(idx, 1);
  res.json({ message: 'Listing deleted' });
});

// POST /api/products/:id/boost  — seller boosts listing (simulated)
router.post('/:id/boost', auth, (req, res) => {
  const product = req.app.locals.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.sellerId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  product.featured = true;
  product.boostedAt = new Date().toISOString();
  res.json({ message: 'Listing boosted successfully', product });
});

// POST /api/products/:id/reveal-phone  — reveal seller phone (auth required)
router.post('/:id/reveal-phone', auth, (req, res) => {
  const product = req.app.locals.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const seller = req.app.locals.users.find(u => u.id === product.sellerId);
  if (!seller) return res.status(404).json({ error: 'Seller not found' });
  res.json({ phone: seller.phone || '+963-11-000-0001' });
});

module.exports = router;
