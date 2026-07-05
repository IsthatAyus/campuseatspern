const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Middleware to check admin role
const adminOnly = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rowCount === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
};

// Get all students
router.get('/students', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, balance, created_at, 
              COUNT(o.id)::int AS order_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get all canteen users
router.get('/canteen-users', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at 
       FROM users 
       WHERE role = 'canteen'
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get all menu items with restaurant info
router.get('/menu-items', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.description, m.price, m.is_available,
              r.id as restaurant_id, r.name as restaurant_name,
              m.created_at
       FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       ORDER BY r.name, m.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const students = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'student\'');
    const canteen = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'canteen\'');
    const orders = await pool.query('SELECT COUNT(*) FROM orders');
    const totalRevenue = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = \'completed\'');

    res.json({
      totalStudents: parseInt(students.rows[0].count),
      totalCanteenUsers: parseInt(canteen.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
