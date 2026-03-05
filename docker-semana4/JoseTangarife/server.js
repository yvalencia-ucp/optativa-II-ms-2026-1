require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});



// DB Ping
app.get("/db/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW();");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear todo
app.post("/todos", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title required" });
  }

  const result = await pool.query(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *;",
    [title]
  );

  res.status(201).json(result.rows[0]);
});

// Listar todos
app.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos;");
  res.json(result.rows);
});
// Health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    serverTime: new Date(),
  });
});

// Crear tabla si no existe (muy útil en Docker)
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

app.listen(3000, () => {
  console.log("El api efectivamente esta funcionando por el puerto 3000, cualquier peticion que sea por este puerto");
});