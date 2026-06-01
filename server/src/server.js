const app = require('./app');
const { pool } = require('./db');
// Ensure user columns exist in users table (helps when DB persisted from older schema)
async function ensureUserColumns() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) NOT NULL DEFAULT 0");
    console.log('Ensured password_hash column exists');
    console.log('Ensured balance column exists');
  } catch (err) {
    console.error('Error ensuring user columns:', err.message);
  }
}

ensureUserColumns();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.json({ message: 'Server is running' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', database: result.rows[0].ok });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Unable to reach PostgreSQL' });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
