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

// Get user orders with items
router.get('/orders', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        o.id,
        o.restaurant_id,
        r.name AS restaurant_name,
        o.status,
        o.total_amount,
        o.created_at,
        json_agg(json_build_object(
          'menu_item_id', oi.menu_item_id,
          'name', mi.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'description', mi.description
        )) AS items
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE o.user_id = $1
      GROUP BY o.id, r.id, r.name, o.status, o.total_amount, o.created_at
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Update user profile — balance excluded, only canteen can top up
router.put('/profile', auth, async (req, res) => {
  const { full_name } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name) WHERE id = $2 RETURNING id, full_name, email, role, balance, created_at`,
      [full_name || null, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Place order from cart
router.post('/orders', auth, async (req, res) => {
  const { restaurant_id, items, total_amount } = req.body;

  if (!restaurant_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing restaurant_id or items' });
  }

  try {
    await pool.query('BEGIN');

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, restaurant_id, status, total_amount) 
       VALUES ($1, $2, 'pending', $3) 
       RETURNING id`,
      [req.user.id, restaurant_id, total_amount]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.menu_item_id, item.quantity, item.unit_price]
      );
    }

    await pool.query(
      `UPDATE users SET balance = balance - $1 WHERE id = $2`,
      [total_amount, req.user.id]
    );

    await pool.query('COMMIT');

    res.json({ id: orderId, status: 'pending', total_amount });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;