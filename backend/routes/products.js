const router = require('express').Router();

// GET /api/products
router.get('/', (req, res) => {
  try {
    let items = [...req.app.locals.products];
    const { category, search, featured, page = 1, limit = 12 } = req.query;

    if (category && category !== 'All') items = items.filter(p => p.category === category);
    if (featured === 'true') items = items.filter(p => p.featured);
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
  res.json({ product });
});

module.exports = router;
