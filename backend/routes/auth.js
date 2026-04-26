const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const auth    = require('../middleware/auth');
const pool    = require('../db');

const SECRET = process.env.JWT_SECRET || 'wholesale_platform_secret_2024';
const sign = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role, createdAt: u.created_at });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (!['buyer', 'seller'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), hashed, role]
    );
    res.status(201).json({ token: sign(rows[0]), user: safe(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email.toLowerCase().trim()]);
    if (!rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(rows[0]), user: safe(rows[0]) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1`, [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: safe(rows[0]) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
