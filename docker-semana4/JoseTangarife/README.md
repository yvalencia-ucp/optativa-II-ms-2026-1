# Semana 4 — Mini entorno de microservicio (Docker + Docker Compose)

## 1. Descripción del proyecto

Este proyecto implementa un mini entorno de microservicios utilizando Docker y Docker Compose.

El sistema está compuesto por:

- Una API desarrollada en Node.js con Express.
- Una base de datos PostgreSQL.
- Comunicación entre servicios mediante una red privada de Docker.
- Persistencia de datos mediante volúmenes.

La API permite crear y consultar tareas almacenadas en la base de datos.

---

## 2. Arquitectura del sistema

El sistema está compuesto por dos servicios:

API (Node.js + Express)
↓
Red privada Docker
↓
PostgreSQL

- La API se conecta a la base de datos usando el hostname del servicio `db`.
- Los datos de PostgreSQL se guardan en un volumen Docker.

---

## 3. Estructura del proyecto
docker-semana4/
nombre-estudiante/api/
package.json
server.js
Dockerfile
.dockerignore
compose.yaml
README.md


---

## 4. Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose

---

## 5. Variables de entorno

Las variables de entorno se definen en `compose.yaml`.

| Variable | Descripción |
|--------|-------------|
| POSTGRES_USER | Usuario de la base de datos |
| POSTGRES_PASSWORD | Contraseña de la base de datos |
| POSTGRES_DB | Nombre de la base de datos |
| DB_HOST | Host de conexión a PostgreSQL (`db`) |
| DB_PORT | Puerto de PostgreSQL |

---

## 6. Cómo ejecutar el proyecto

### 1. Clonar el repositorio

git clone <repo>
cd docker-semana4


### 2. Levantar los servicios


Esto iniciará:

- API en `http://localhost:3000`
- PostgreSQL en el contenedor `db`

### 3. Verificar contenedores

docker compose ps


---

## 7. Endpoints disponibles

### Health Check

GET /health


Ejemplo:

curl http://localhost:3000/health


Respuesta esperada:

{
"status": "ok",
"time": "2026-03-05T18:00:00.000Z"
}


---

### Ping a base de datos

GET /db/ping

curl http://localhost:3000/db/ping


Respuesta:

{
"result": "2026-03-05T18:01:00.000Z"
}


---

### Crear tarea
POST /todos


Ejemplo: 

curl -X POST http://localhost:3000/todos

-H "Content-Type: application/json"
-d '{"title":"Aprender Docker"}'


---

### Listar tareas

GET /todos

curl http://localhost:3000/todos



---
## 8. Evidencias de funcionamiento
https://docs.google.com/document/d/1s7M11tF1B68Xl-8yObnFfDxUBW5udfqTOXGyZhgxaUI/edit?usp=sharing

