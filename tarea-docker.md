# Semana 4 — Tarea (Docker + Docker Compose) — “Mini entorno de microservicio”

---

## Objetivo de la tarea
Crear un mini-proyecto que contenga:

1) Un servicio **API** (Node.js + Express) con un endpoint de salud y un endpoint que lea/escriba en la base de datos.  
2) Un servicio **PostgreSQL** con persistencia mediante **volumen**.  
3) Comunicación entre servicios usando una **red privada** (por nombre del servicio, no `localhost`).  
4) Orquestación con **Docker Compose**.

---

## Reglas
- **No** se permite ejecutar Postgres fuera de Docker (nada de Postgres local).
- La API **no** puede usar `localhost` para conectarse a Postgres; debe usar el **hostname del servicio** en la red (ej: `db`).
- Deben existir:
  - `Dockerfile` para la API
  - `compose.yaml` (o `docker-compose.yml`)
  - `.dockerignore`
  - `README.md` con instrucciones de ejecución y evidencias

---

## Requisitos mínimos del proyecto
### A) API (Node.js + Express)
Debe exponer:
- `GET /health` → responde `{"status":"ok"}` y hora del servidor
- `GET /db/ping` → consulta simple (ej: `SELECT NOW();`) y devuelve el resultado
- `POST /todos` → crea una tarea en BD
- `GET /todos` → lista tareas

**Pista:** crea una tabla `todos(id serial, title text, done boolean default false, created_at timestamptz default now())`.

### B) Base de datos (PostgreSQL)
- Usuario/clave definidos por variables de entorno en Compose
- Volumen para persistir datos (si bajas y subes, debe seguir la tabla y los registros)

### C) Docker Compose
- Debe levantar 2 servicios: `api` y `db`
- Debe definir:
  - una red (por ejemplo `micro-net`)
  - un volumen (por ejemplo `pgdata`)
- `api` debe depender de `db` (con `depends_on`) y usar variables para host, puerto, usuario, password, dbname

---

## Estructura sugerida del repositorio
```
docker-semana4/
  nombre-completo-estudiante/api/
    package.json
    server.js
    Dockerfile
    .dockerignore
  compose.yaml
  README.md
```

---

## Pasos guiados (lo que hacemos en clase)
1) Crear repo y carpeta `nombre-completo-estudiante/api/`
2) Crear `server.js` con Express y endpoints
3) Probar API local (sin Docker) para validar lógica
4) Crear Dockerfile de la API
5) Construir imagen y correr contenedor de API (solo) para validar
6) Crear Compose con `db` + `api`
7) Probar endpoints desde el host


---

## Checklist de entrega (lo que deben mostrar)
Incluye en el `README.md`:

1) **Cómo ejecutar**
- `docker compose up --build`
- URL de la API y endpoints

2) **Evidencias**
- Captura o salida de:
  - `docker compose ps`
  - `curl http://localhost:3000/health`
  - `curl http://localhost:3000/db/ping`
  - `curl -X POST ... /todos`
  - `curl ... /todos`
- Evidencia de persistencia:
  - Levantar, crear `todos`, bajar (`docker compose down`), subir de nuevo, y mostrar que los datos siguen.
  
---

## Criterios de evaluación (rubrica simple)
- (30%) Compose levanta correctamente `api` y `db` (`up --build` sin errores)
- (25%) Comunicación API ↔ DB usando red privada (host `db`)
- (20%) Persistencia con volumen demostrada
- (15%) Dockerfile correcto y eficiente (usa cache, `.dockerignore`)
- (10%) README claro + evidencias

---


## FAQ (para investigación)
- ¿Qué significa `depends_on` y qué NO garantiza?
- ¿Cómo funciona el DNS interno de Docker?
- ¿Diferencia entre volumen y bind mount?
