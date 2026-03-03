const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(express.json());

// Pool de conexiones (se crea una sola vez)
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'todos',
  password: process.env.DB_PASSWORD || 'pass123',
  database: process.env.DB_NAME || 'todos_db',
  // Opcional pero recomendado en producción
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware global de errores (debe ir ANTES de las rutas)
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check simple
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ping a la base de datos
app.get('/db/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database_time: result.rows[0].now,
    });
  } catch (err) {
    console.error('DB ping failed:', err.message);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// Función para inicializar la tabla con reintentos
async function initializeDatabase(maxRetries = 8, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id          SERIAL PRIMARY KEY,
          title       TEXT NOT NULL,
          done        BOOLEAN DEFAULT FALSE,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('Tabla "todos" verificada/creada exitosamente');
      return true;
    } catch (err) {
      console.warn(`Intento ${attempt}/${maxRetries} fallido: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('No se pudo inicializar la base de datos después de varios intentos');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// Rutas de la API
app.post('/todos', async (req, res, next) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'El campo "title" es obligatorio y debe ser texto no vacío' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.get('/todos', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`🚀 Server corriendo en http://localhost:${port}`);
      console.log(`   Health check:     http://localhost:${port}/health`);
      console.log(`   DB ping:          http://localhost:${port}/db/ping`);
    });
  } catch (err) {
    console.error('Error crítico al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();