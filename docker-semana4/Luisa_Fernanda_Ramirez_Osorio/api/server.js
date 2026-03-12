const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuración de la conexión a la base de datos usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Inicializar la tabla si no existe
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id serial PRIMARY KEY, 
        title text NOT NULL, 
        done boolean DEFAULT false, 
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log("Tabla 'todos' lista.");
  } catch (error) {
    console.error("Error inicializando la BD:", error);
  }
};
initDB();

// Endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/db/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW();');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en el puerto ${PORT}`));