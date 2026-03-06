const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuración de la base de datos usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Inicialización de la tabla
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Tabla 'todos' lista.");
  } catch (err) {
    console.error("Error inicializando DB:", err);
  }
};
initDb();

// 1. Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: "ok", server_time: new Date().toISOString() });
});

// 2. DB Ping
app.get('/db/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW();');
    res.json({ status: "connected", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /todos
app.post('/todos', async (req, res) => {
  const { title, done = false } = req.body;	

  try {
    const result = await pool.query('INSERT INTO todos (title, done) VALUES ($1, $2) RETURNING *', [title, done]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
