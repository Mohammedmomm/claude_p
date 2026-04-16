const router = require('express').Router();
const auth   = require('../middleware/auth');
const { v4: uuid } = require('uuid');

// GET /api/chat/conversations
router.get('/conversations', auth, (req, res) => {
  const uid = req.user.id;
  const msgs = req.app.locals.messages;
  const partnersMap = {};

  msgs.filter(m => m.senderId === uid || m.receiverId === uid).forEach(m => {
    const partnerId = m.senderId === uid ? m.receiverId : m.senderId;
    if (!partnersMap[partnerId] || new Date(m.timestamp) > new Date(partnersMap[partnerId].lastMessage.timestamp)) {
      partnersMap[partnerId] = { partnerId, lastMessage: m };
    }
  });

  const users = req.app.locals.users;
  const conversations = Object.values(partnersMap).map(({ partnerId, lastMessage }) => {
    const partner = users.find(u => u.id === partnerId);
    const unread = msgs.filter(m => m.senderId === partnerId && m.receiverId === uid && !m.read).length;
    return {
      partnerId,
      partnerName: partner ? partner.name : 'Unknown',
      partnerRole: partner ? partner.role : 'buyer',
      lastMessage: lastMessage.message,
      lastTime: lastMessage.timestamp,
      unread,
    };
  }).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

  res.json({ conversations });
});

// GET /api/chat/:partnerId
router.get('/:partnerId', auth, (req, res) => {
  const uid = req.user.id;
  const pid = req.params.partnerId;

  const messages = req.app.locals.messages
    .filter(m => (m.senderId === uid && m.receiverId === pid) || (m.senderId === pid && m.receiverId === uid))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // mark as read
  req.app.locals.messages.forEach(m => {
    if (m.senderId === pid && m.receiverId === uid) m.read = true;
  });

  const partner = req.app.locals.users.find(u => u.id === pid);
  res.json({ messages, partner: partner ? { id: partner.id, name: partner.name, role: partner.role } : null });
});

// POST /api/chat/send
router.post('/send', auth, (req, res) => {
  const { receiverId, message } = req.body;
  if (!receiverId || !message?.trim()) return res.status(400).json({ error: 'receiverId and message required' });

  const receiver = req.app.locals.users.find(u => u.id === receiverId);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

  const msg = {
    id: uuid(),
    senderId: req.user.id,
    receiverId,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  req.app.locals.messages.push(msg);
  res.status(201).json({ message: msg });
});

module.exports = router;
