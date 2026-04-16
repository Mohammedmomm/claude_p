const router = require('express').Router();
const auth   = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// PUT /api/users/profile
router.put('/profile', auth, (req, res) => {
  const { name, phone } = req.body;
  const user = req.app.locals.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (name)  user.name  = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

// PUT /api/users/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    const user = req.app.locals.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ message: 'Password updated successfully' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/users/account
router.delete('/account', auth, (req, res) => {
  req.app.locals.users = req.app.locals.users.filter(u => u.id !== req.user.id);
  delete req.app.locals.carts[req.user.id];
  res.json({ message: 'Account deleted' });
});

// GET /api/users/:id  (public profile)
router.get('/:id', (req, res) => {
  const user = req.app.locals.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, role: user.role } });
});

module.exports = router;
