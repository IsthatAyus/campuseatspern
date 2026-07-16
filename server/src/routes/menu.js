const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.description, m.price, m.is_available,
              r.id as restaurant_id, r.name as restaurant_name
       FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE m.is_available = TRUE
       ORDER BY r.name, m.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;