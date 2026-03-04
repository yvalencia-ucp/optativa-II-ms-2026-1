const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// ===============================
// Conexión a PostgreSQL
// ===============================
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ===============================
// Crear tabla automáticamente
// ===============================
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos(
      id SERIAL PRIMARY KEY,
      title TEXT,
      done BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// ===============================
// ENDPOINTS
// ===============================

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date(),
  });
});

// DB ping
app.get("/db/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear TODO
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;

    const result = await pool.query(
      "INSERT INTO todos(title) VALUES($1) RETURNING *",
      [title]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar TODOs
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Iniciar servidor SOLO cuando DB esté lista
// ===============================
async function startServer() {
  try {
    console.log("Waiting database...");

    await initDB();

    console.log("Database ready ✅");

    app.listen(3000, () => {
      console.log("API running on port 3000 🚀");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();