const router = require('express').Router();
const auth   = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const pool   = require('../db');

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone) WHERE id=$3 RETURNING id,name,email,phone,role`,
      [name?.trim() || null, phone?.trim() ?? null, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/users/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1`, [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/users/account
router.delete('/account', auth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id=$1`, [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/:id  (public profile)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT id,name,role,phone FROM users WHERE id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
