const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Interfaz web (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "public")));

// Configuración de la conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || "db", // Usa 'db' como hostname en la red Docker
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware para manejar errores de conexión
pool.on("error", (err) => {
  console.error("Error en la conexión a PostgreSQL:", err);
});

// Endpoint de salud
app.get("/health", (req, res) => {
  const now = new Date().toISOString();
  res.json({ status: "ok", time: now });
});

// Endpoint para ping a la DB (SELECT NOW())
app.get("/db/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar la DB" });
  }
});

// Crear la tabla si no existe (se ejecuta al iniciar el servidor)
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tabla "todos" creada o ya existe.');
  } catch (err) {
    console.error("Error al inicializar la DB:", err);
  }
}

// Endpoint para crear una tarea
app.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Falta el título" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      [title],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
});

// Endpoint para listar tareas
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar tareas" });
  }
});

// Marcar tarea como hecha/pendiente (para la interfaz)
app.patch("/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { done } = req.body;
  if (isNaN(id) || typeof done !== "boolean") {
    return res.status(400).json({ error: "id inválido o falta done (boolean)" });
  }
  try {
    const result = await pool.query(
      "UPDATE todos SET done = $1 WHERE id = $2 RETURNING *",
      [done, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// Eliminar tarea (para la interfaz)
app.delete("/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// Iniciar el servidor y la DB
app.listen(port, async () => {
  console.log(`API escuchando en http://localhost:${port}`);
  await initDb(); // Inicializa la tabla al empezar
});
