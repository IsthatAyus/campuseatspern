const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

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
      `SELECT u.id, u.full_name, u.email, u.role, u.balance, u.created_at,
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

// Update student (balance, full_name)
router.put('/students/:id', auth, adminOnly, async (req, res) => {
  const { full_name, balance } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           balance   = COALESCE($2, balance)
       WHERE id = $3 AND role = 'student'
       RETURNING id, full_name, email, role, balance, created_at`,
      [full_name ?? null, balance ?? null, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Delete student
router.delete('/students/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND role = 'student' RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true });
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

// Add canteen user
router.post('/canteen-users', auth, adminOnly, async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ error: 'full_name, email and password are required' });
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'canteen')
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'DB error' });
  }
});

// Update canteen user (full_name, email)
router.put('/canteen-users/:id', auth, adminOnly, async (req, res) => {
  const { full_name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email     = COALESCE($2, email)
       WHERE id = $3 AND role = 'canteen'
       RETURNING id, full_name, email, role, created_at`,
      [full_name ?? null, email ?? null, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Canteen user not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'DB error' });
  }
});

// Delete canteen user
router.delete('/canteen-users/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND role = 'canteen' RETURNING id`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Canteen user not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Get all menu items
router.get('/menu-items', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.description, m.price, m.is_available,
              r.id as restaurant_id, r.name as restaurant_name, m.created_at
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
    const students     = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`);
    const canteen      = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'canteen'`);
    const orders       = await pool.query(`SELECT COUNT(*) FROM orders`);
    const totalRevenue = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'`);
    res.json({
      totalStudents:    parseInt(students.rows[0].count),
      totalCanteenUsers: parseInt(canteen.rows[0].count),
      totalOrders:      parseInt(orders.rows[0].count),
      totalRevenue:     parseFloat(totalRevenue.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;