const express = require("express");
const { pool } = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");

    res.json({
      status: "ok",
      database: result.rows[0].ok,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Unable to reach PostgreSQL",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
