const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Protected route: get current user
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
