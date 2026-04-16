const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const { v4: uuid } = require('uuid');
const products = require('./data/products');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Seed default users ────────────────────────────────────
const sellerHash = bcrypt.hashSync('seller123', 10);
const buyerHash  = bcrypt.hashSync('buyer123',  10);
const SELLER_ID  = 'seller_demo';
const BUYER_ID   = 'buyer_demo';

// ── In-memory store ───────────────────────────────────────
app.locals.users = [
  { id: SELLER_ID, name: 'Demo Seller',  email: 'seller@demo.com', password: sellerHash, role: 'seller', phone: '+963-11-000-0001', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: BUYER_ID,  name: 'Demo Buyer',   email: 'buyer@demo.com',  password: buyerHash,  role: 'buyer',  phone: '+963-11-000-0002', createdAt: '2024-01-01T00:00:00.000Z' },
];
app.locals.products  = products;
app.locals.carts     = {};
app.locals.orders    = [];
app.locals.wishlist  = {};

app.locals.messages = [
  { id: uuid(), senderId: SELLER_ID, receiverId: BUYER_ID, message: 'مرحباً! كيف يمكنني مساعدتك؟', timestamp: new Date(Date.now() - 60*60*1000).toISOString(), read: true },
  { id: uuid(), senderId: BUYER_ID,  receiverId: SELLER_ID, message: 'أريد الاستفسار عن منتج iPhone 15 Pro', timestamp: new Date(Date.now() - 55*60*1000).toISOString(), read: true },
  { id: uuid(), senderId: SELLER_ID, receiverId: BUYER_ID, message: 'بالطبع! المنتج متوفر وسعر الجملة متاح حتى مساء اليوم.', timestamp: new Date(Date.now() - 50*60*1000).toISOString(), read: true },
  { id: uuid(), senderId: BUYER_ID,  receiverId: SELLER_ID, message: 'ممتاز، هل يمكن التوصيل لدمشق؟', timestamp: new Date(Date.now() - 10*60*1000).toISOString(), read: false },
];

app.locals.reviews = [
  { id: uuid(), productId: 'p1', userId: BUYER_ID, userName: 'Demo Buyer', rating: 5, comment: 'منتج رائع جداً، يستحق السعر', createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: uuid(), productId: 'p1', userId: 'u_test1', userName: 'أحمد محمد', rating: 4, comment: 'جيد جداً لكن الشحن تأخر قليلاً', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: uuid(), productId: 'p2', userId: BUYER_ID, userName: 'Demo Buyer', rating: 4, comment: 'Samsung ممتاز للاستخدام اليومي', createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  { id: uuid(), productId: 'p9', userId: BUYER_ID, userName: 'Demo Buyer', rating: 5, comment: 'أفضل حذاء اشتريته، مريح جداً', createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
  { id: uuid(), productId: 'p15',userId: BUYER_ID, userName: 'Demo Buyer', rating: 5, comment: 'زيت زيتون عضوي أصلي 100٪', createdAt: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
];

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/chat',     require('./routes/chat'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/users',    require('./routes/users'));

// ── Wishlist (inline) ──────────────────────────────────────
const authMW = require('./middleware/auth');

app.get('/api/wishlist', authMW, (req, res) => {
  const ids = req.app.locals.wishlist[req.user.id] || [];
  const items = ids.map(id => req.app.locals.products.find(p => p.id === id)).filter(Boolean);
  res.json({ items, ids });
});

app.post('/api/wishlist/:productId', authMW, (req, res) => {
  const uid = req.user.id;
  const pid = req.params.productId;
  if (!req.app.locals.wishlist[uid]) req.app.locals.wishlist[uid] = [];
  const list = req.app.locals.wishlist[uid];
  const idx  = list.indexOf(pid);
  let added;
  if (idx >= 0) { list.splice(idx, 1); added = false; }
  else          { list.push(pid);       added = true;  }
  res.json({ added, ids: list });
});

// ── Health ──────────────────────────────────────────────────
app.get('/', (_, res) => res.json({ message: 'Jumla Wholesale API v1.0', status: 'running' }));

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  Jumla API running → http://localhost:${PORT}`));
