const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { full_name, email, password, role } = req.body;
  if (!full_name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, COALESCE($4,\'student\')) ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash RETURNING id, full_name, email, role, balance',
      [full_name, email, hash, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Login: simple email-based login for demo (no password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const result = await pool.query('SELECT id, full_name, email, role, balance, password_hash FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    const user = result.rows[0];
    if (!user.password_hash) return res.status(400).json({ error: 'Password not set for user' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h' });
    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, balance: user.balance }, token });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
