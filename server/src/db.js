const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://campuseats:campuseats@localhost:5432/campuseats";

const pool = new Pool({
  connectionString,
});

module.exports = { pool };