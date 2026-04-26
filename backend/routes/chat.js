const router = require('express').Router();
const auth   = require('../middleware/auth');
const pool   = require('../db');

// GET /api/chat/conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (partner_id)
         partner_id,
         m.message, m.created_at AS last_time, m.is_voice,
         u.name AS partner_name, u.role AS partner_role,
         (SELECT COUNT(*) FROM messages WHERE sender_id=partner_id AND receiver_id=$1 AND read=false) AS unread
       FROM (
         SELECT CASE WHEN sender_id=$1 THEN receiver_id ELSE sender_id END AS partner_id,
                id, message, created_at, is_voice
         FROM messages WHERE sender_id=$1 OR receiver_id=$1
       ) m JOIN users u ON u.id=m.partner_id
       ORDER BY partner_id, m.created_at DESC`, [uid]
    );
    res.json({ conversations: rows.map(r => ({
      partnerId: r.partner_id,
      partnerName: r.partner_name,
      partnerRole: r.partner_role,
      lastMessage: r.message,
      lastTime: r.last_time,
      unread: +r.unread,
    })).sort((a,b) => new Date(b.lastTime)-new Date(a.lastTime)) });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/chat/:partnerId
router.get('/:partnerId', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const pid = req.params.partnerId;
    const { rows: messages } = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at ASC`, [uid, pid]
    );
    await pool.query(
      `UPDATE messages SET read=true WHERE sender_id=$1 AND receiver_id=$2 AND read=false`, [pid, uid]
    );
    const { rows: partnerRows } = await pool.query(`SELECT id,name,role FROM users WHERE id=$1`, [pid]);
    res.json({
      messages: messages.map(m => ({ ...m, timestamp: m.created_at, isVoice: m.is_voice, voiceDuration: m.voice_duration })),
      partner: partnerRows[0] || null,
    });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/chat/send
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, message, isVoice = false, voiceDuration = 0 } = req.body;
    if (!receiverId || !message?.trim()) return res.status(400).json({ error: 'receiverId and message required' });
    const { rows: recv } = await pool.query(`SELECT id FROM users WHERE id=$1`, [receiverId]);
    if (!recv[0]) return res.status(404).json({ error: 'Receiver not found' });
    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id,receiver_id,message,is_voice,voice_duration) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, receiverId, message.trim(), isVoice, voiceDuration]
    );
    const msg = rows[0];
    res.status(201).json({ message: { ...msg, timestamp: msg.created_at, isVoice: msg.is_voice, voiceDuration: msg.voice_duration } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
