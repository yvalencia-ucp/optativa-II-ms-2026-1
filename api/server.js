const express = require('express');
const { Pool } = require('pg');


const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'db';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'appdb';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});


async function initDb() {
  const createTable = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      created_at timestamptz DEFAULT now()
    );
  `;
  await pool.query(createTable);
}


async function waitForDb(retries = 10, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      console.log(`database not ready, retrying (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('could not connect to database after retries');
}

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/db/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('db ping error', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('insert todo error', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('select todos error', err);
    res.status(500).json({ error: 'database error' });
  }
});


(async () => {
  try {
    await waitForDb();
    await initDb();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start application', err);
    process.exit(1);
  }
})();
