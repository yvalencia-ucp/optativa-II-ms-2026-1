# Mini entorno de microservicio (Docker + Compose)

Este repositorio contiene un ejemplo simple de una API Node.js + Express que se comunica con una base de datos PostgreSQL usando Docker Compose.

## Estructura

```
/docker-semana4/
  api/
    package.json
    server.js
    Dockerfile
    .dockerignore
  compose.yaml
  README.md
```

## Cómo ejecutar

1. Construir y levantar los servicios:

   ```bash
   docker compose up --build
   ```

2. La API quedará disponible en `http://localhost:3000`.

3. Endpoints disponibles:
   - `GET /health` → estado del servicio con hora
   - `GET /db/ping` → consulta simple a la base de datos
   - `POST /todos` → crear una tarea (envía JSON `{ "title": "texto" }`)
   - `GET /todos` → listar todas las tareas

## Variables de entorno usadas en Compose

El servicio `api` expone variables para configurar la conexión a PostgreSQL:

```yaml
DB_HOST: db        # nombre del servicio de la base
DB_PORT: "5432"
DB_USER: postgres
DB_PASSWORD: postgres
DB_NAME: appdb
PORT: "3000"
```

## Evidencias sugeridas

Puedes guardar capturas o simplemente pegar la salida de los comandos.

1. `docker compose ps` (muestra `api` y `db` arriba)
2. `curl http://localhost:3000/health`
3. `curl http://localhost:3000/db/ping`
4. `curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"title":"Estudiar Docker"}'`
5. `curl http://localhost:3000/todos`

Persistencia:

- `docker compose down`
- `docker compose up --build`
- repetir `curl /todos` y ver que los registros siguen existiendo

## Notas breves

- El contenedor de la API se conecta a la base mediante el hostname `db` en la red `micro-net`.
- El volumen nombrado `pgdata` asegura que los datos de Postgres sobrevivan al ciclo de vida de los contenedores.
- El Dockerfile usa la cache al copiar primero los `package*.json`.
