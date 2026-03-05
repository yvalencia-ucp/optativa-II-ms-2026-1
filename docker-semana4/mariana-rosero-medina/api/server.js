const express = require('express');
const app = express();
const port = 3000;

const { Pool } = require('pg');

// Configuramos la conexión usando las variables de entorno de Docker
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Función auxiliar para crear la tabla de 'todos' si no existe
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Tabla 'todos' asegurada en la base de datos.");
}
initDB();

// Para que nuestra API pueda leer JSON en el body (lo necesitaremos para el POST)
app.use(express.json()); 

// --- Aquí irán nuestros endpoints ---
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    time: new Date()
  });
});

app.get('/db/ping', async (req, res) => {
    try {
    const resultado = await pool.query('SELECT NOW()');
    // Enviamos la primera fila de los resultados
    res.json(resultado.rows[0]); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});

app.get('/todos', async (req, res) => {
    try {
    const resultado = await pool.query('SELECT * FROM todos');
    //enviamos TODAS las fila
    res.json(resultado.rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar tareas" });
  }
});

app.post('/todos', async (req, res) => {
  try {
    // Sacamos el título de la tarea que nos envía el cliente en el body
    const { title } = req.body; 
    
    // Insertamos en la BD de forma segura (el $1 evita inyecciones SQL)
    const resultado = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    
    // Respondemos con código 201 (Creado) y la tarea nueva
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
});

app.listen(port, () => {
  console.log(`API corriendo localmente en http://localhost:${port}`);
});