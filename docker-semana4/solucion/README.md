# Solución Tarea Docker (Semana 4)

Este proyecto implementa un mini entorno de microservicios con una API en Node.js y una base de datos PostgreSQL, orquestados con Docker Compose.

## Estructura del Proyecto

```
solucion/
  api/
    package.json
    server.js
    Dockerfile
    .dockerignore
  compose.yaml
  README.md
```

## Requisitos Previos

- Docker
- Docker Compose

## Instrucciones de Ejecución

1. Clonar el repositorio y navegar a la carpeta del proyecto:
   ```bash
   cd solucion
   ```

2. Construir y levantar los servicios:
   ```bash
   docker compose up --build
   ```
   
   Para ejecutar en segundo plano (detached mode):
   ```bash
   docker compose up --build -d
   ```

3. Verificar que los servicios estén corriendo:
   ```bash
   docker compose ps
   ```

4. Para detener los servicios:
   ```bash
   docker compose down
   ```
   
   Para detener y eliminar volúmenes (¡cuidado, borra los datos!):
   ```bash
   docker compose down -v
   ```

## Endpoints de la API

La API corre en el puerto `3000`.

### 1. Health Check
Verifica que el servidor esté activo.
- **GET** `/health`
- Ejemplo:
  ```bash
  curl http://localhost:3000/health
  ```

### 2. DB Ping
Verifica la conexión a la base de datos.
- **GET** `/db/ping`
- Ejemplo:
  ```bash
  curl http://localhost:3000/db/ping
  ```

### 3. Crear Tarea (Todo)
Crea una nueva tarea en la base de datos.
- **POST** `/todos`
- Body: `{"title": "Texto de la tarea"}`
- Ejemplo:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"title": "Aprender Docker"}' http://localhost:3000/todos
  ```

### 4. Listar Tareas
Obtiene todas las tareas creadas.
- **GET** `/todos`
- Ejemplo:
  ```bash
  curl http://localhost:3000/todos
  ```

## Evidencias

A continuación se muestran los comandos para verificar el funcionamiento.

### Estado de los contenedores
```bash
docker compose ps
```

### Pruebas de Endpoints
```bash
# Health Check
curl http://localhost:3000/health

# DB Ping
curl http://localhost:3000/db/ping

# Crear Tarea
curl -X POST -H "Content-Type: application/json" -d '{"title": "Tarea de prueba 1"}' http://localhost:3000/todos

# Listar Tareas
curl http://localhost:3000/todos
```

### Persistencia de Datos
1. Crear una tarea (como se mostró arriba).
2. Detener los contenedores: `docker compose down`.
3. Volver a levantarlos: `docker compose up -d`.
4. Listar las tareas de nuevo: `curl http://localhost:3000/todos`.
   - Deberían aparecer las tareas creadas anteriormente.
