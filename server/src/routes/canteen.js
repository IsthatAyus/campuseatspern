const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Middleware to check canteen role
const canteenOnly = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rowCount === 0 || result.rows[0].role !== 'canteen') {
      return res.status(403).json({ error: 'Canteen access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

// Get canteen's restaurant
router.get('/restaurant', auth, canteenOnly, async (req, res) => {
  try {
    // For now, assign first restaurant to canteen user
    const result = await pool.query(
      `SELECT id, name, cuisine, location, is_open FROM restaurants LIMIT 1`
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No restaurant assigned' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get menu items for canteen's restaurant
router.get('/menu', auth, canteenOnly, async (req, res) => {
  try {
    const restaurant = await pool.query(`SELECT id FROM restaurants LIMIT 1`);
    const restaurantId = restaurant.rows[0].id;

    const result = await pool.query(
      `SELECT id, name, description, price, is_available, created_at
       FROM menu_items
       WHERE restaurant_id = $1
       ORDER BY name`,
      [restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Add menu item
router.post('/menu', auth, canteenOnly, async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const restaurant = await pool.query(`SELECT id FROM restaurants LIMIT 1`);
    const restaurantId = restaurant.rows[0].id;

    const result = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, is_available)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, name, description, price, is_available`,
      [restaurantId, name, description, price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Menu item already exists' });
    }
    res.status(500).json({ error: 'DB error' });
  }
});

// Delete menu item
router.delete('/menu/:id', auth, canteenOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM menu_items WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Toggle menu item availability
router.patch('/menu/:id/availability', auth, canteenOnly, async (req, res) => {
  const { id } = req.params;
  const { is_available } = req.body;

  try {
    const result = await pool.query(
      `UPDATE menu_items SET is_available = $1 WHERE id = $2 RETURNING *`,
      [is_available, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get orders for canteen
router.get('/orders', auth, canteenOnly, async (req, res) => {
  try {
    const restaurant = await pool.query(`SELECT id FROM restaurants LIMIT 1`);
    const restaurantId = restaurant.rows[0].id;

    const result = await pool.query(
      `SELECT o.id, o.user_id, u.full_name, u.email, o.status, o.total_amount, o.created_at,
              ARRAY_AGG(json_build_object('item', mi.name, 'quantity', oi.quantity, 'price', oi.unit_price)) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.restaurant_id = $1
       GROUP BY o.id, u.full_name, u.email
       ORDER BY o.created_at DESC`,
      [restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Update order status
router.patch('/orders/:id/status', auth, canteenOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Add balance to student account
router.post('/add-student-balance', auth, canteenOnly, async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid email or amount' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET balance = balance + $1 WHERE email = $2 AND role = 'student'
       RETURNING id, full_name, email, balance`,
      [amount, email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
