const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const auth    = require('../middleware/auth');

const SECRET = 'wholesale_platform_secret_2024';
const sign = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role, createdAt: u.createdAt });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (!['buyer', 'seller'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const users = req.app.locals.users;
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuid(), name, email, password: hashed, role, phone: '', createdAt: new Date().toISOString() };
    users.push(user);
    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = req.app.locals.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const user = req.app.locals.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: safe(user) });
});

module.exports = router;
