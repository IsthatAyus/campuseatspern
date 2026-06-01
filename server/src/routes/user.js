const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Protected route: get current user
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.balance,
        u.created_at,
        COUNT(o.id)::int AS order_count
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id`,
      [req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
