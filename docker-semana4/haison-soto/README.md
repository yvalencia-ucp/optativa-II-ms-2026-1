## Mini entorno de microservicio — Semana 4

Este proyecto implementa un mini entorno de microservicio con:

- **API** en Node.js + Express
- **Base de datos** PostgreSQL con volumen para persistencia
- **Orquestación** con Docker Compose

La comunicación entre servicios se hace por **red privada** usando el nombre del servicio `db` (no se usa `localhost` dentro del contenedor).

---

## Cómo ejecutar

1. Asegúrate de estar en la carpeta del proyecto:

   ```bash
   cd haison
   ```

2. Construir y levantar los servicios (si tienes `docker-compose` clásico):

   ```bash
   docker-compose up --build
   ```

   Si tu Docker soporta el nuevo subcomando `docker compose`, también podrías usar:

   ```bash
   docker compose up --build
   ```

3. La API y la interfaz web quedarán disponibles en:

   - **Interfaz web (lista de tareas):** `http://localhost:3000/`
   - **Endpoints de la API:** `http://localhost:3000/health`, `http://localhost:3000/db/ping`, `http://localhost:3000/todos` (GET y POST)

Para detener los servicios:

```bash
docker-compose down
```

---

## Servicios y configuración

- **Servicio `db` (PostgreSQL)**:
  - Imagen: `postgres:16-alpine`
  - Usuario: `appuser`
  - Password: `secretpassword`
  - Base de datos: `appdb`
  - Volumen: `pgdata:/var/lib/postgresql/data`

- **Servicio `api` (Node.js + Express)**:
  - Construido desde `DockerFile` en la raíz del proyecto
  - Usa las variables de entorno:
    - `DB_HOST=db`
    - `DB_PORT=5432`
    - `DB_USER=appuser`
    - `DB_PASSWORD=secretpassword`
    - `DB_NAME=appdb`

Dentro del contenedor, la API se conecta a Postgres usando el hostname **`db`**, que es resuelto por el DNS interno de Docker en la red `micro-net`.

---

## Endpoints de la API

- **GET `/health`**

  Respuesta de ejemplo:

  ```json
  {
    "status": "ok",
    "time": "2026-03-01T12:34:56.789Z"
  }
  ```

- **GET `/db/ping`**

  Ejecuta `SELECT NOW();` en la base de datos y devuelve la hora de la DB:

  ```json
  {
    "db_time": "2026-03-01T12:35:10.123Z"
  }
  ```

- **POST `/todos`**

  Crea una tarea en la tabla `todos`:

  ```bash
  curl -X POST http://localhost:3000/todos \
    -H "Content-Type: application/json" \
    -d '{"title":"mi primera tarea"}'
  ```

  Respuesta de ejemplo:

  ```json
  {
    "id": 1,
    "title": "mi primera tarea",
    "done": false,
    "created_at": "2026-03-01T12:36:00.000Z"
  }
  ```

- **GET `/todos`**

  Lista todas las tareas:

  ```bash
  curl http://localhost:3000/todos
  ```

  Respuesta de ejemplo:

  ```json
  [
    {
      "id": 1,
      "title": "mi primera tarea",
      "done": false,
      "created_at": "2026-03-01T12:36:00.000Z"
    }
  ]
  ```

- **PATCH `/todos/:id`** (opcional, para la interfaz): actualiza una tarea (ej. marcar como hecha). Body: `{"done": true}` o `{"done": false}`.
- **DELETE `/todos/:id`** (opcional): elimina una tarea.

Los requisitos de la tarea siguen siendo **GET /health**, **GET /db/ping**, **POST /todos** y **GET /todos**; el resto son mejoras para la interfaz.

---

## Interfaz web

La aplicación sirve una interfaz HTML/CSS/JS en la raíz (`http://localhost:3000/`) para gestionar las tareas: añadir, marcar como hechas y eliminar. El indicador "Sistema en línea" usa el endpoint `/health`.

---

## Checklist de entrega (comandos y evidencias)

Usa estos comandos y guarda la salida en **capturas de pantalla** o pegada en este README, según te pida el profesor:

1. **Levantar todo el entorno**  

   ```bash
   docker-compose up --build
   ```

2. **Ver servicios levantados** (usa uno de los dos, según tu instalación):

   ```bash
   docker-compose ps
   # o
   docker compose ps
   ```

3. **Probar endpoint de salud**:

   ```bash
   curl http://localhost:3000/health
   ```

4. **Probar conexión a la base de datos**:

   ```bash
   curl http://localhost:3000/db/ping
   ```

5. **Crear un TODO**:

   ```bash
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"title":"mi primera tarea"}'
   ```

6. **Listar TODOS**:

   ```bash
   curl http://localhost:3000/todos
   ```

---

## Evidencia de persistencia con volumen

1. Levanta los servicios y crea algunos `todos`:

   ```bash
   docker-compose up --build
   # en otra terminal:
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"title":"tarea persistente"}'
   ```

2. Verifica que existan:

   curl http://localhost:3000/todos

3. Bajo los servicios:

   docker-compose down

4. Vuelve a levantarlos:

   docker-compose up

5. Verifica que los `todos` sigan ahí:

   ```bash
   curl http://localhost:3000/todos
   ```

Guarda capturas de la respuesta **antes** y **después** de bajar y subir los servicios para demostrar la persistencia.

---

## FAQ (resumen rápido)

- **¿Qué significa `depends_on` y qué NO garantiza?**  
  `depends_on` indica que el contenedor `api` se crea **después** de `db`, pero **no garantiza** que Postgres ya esté totalmente listo para aceptar conexiones. Por eso es normal que la app tenga que reintentar o manejar errores de conexión al inicio.

- **¿Cómo funciona el DNS interno de Docker?**  
  Dentro de una misma red de Docker (por ejemplo `micro-net`), cada servicio se puede resolver usando su **nombre de servicio** (`db`, `api`). Docker proporciona un DNS interno que traduce esos nombres al IP correspondiente del contenedor.

- **Diferencia entre volumen y bind mount**  
  - **Volumen**: lo maneja Docker, se almacena en una ruta interna de Docker. Es ideal para datos de bases de datos (como `pgdata`) y es más portátil y fácil de gestionar.
  - **Bind mount**: mapea un directorio específico del host a un directorio del contenedor. Depende de la ruta del host y es útil para desarrollo (por ejemplo, compartir código fuente).

cd /home/hosatioon/Escritorio/haison-soto-semana4/haison
docker-compose up --build
