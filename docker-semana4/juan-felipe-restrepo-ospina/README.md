# Mini Entorno de Microservicio — Semana 4

## Descripción

Proyecto que implementa:

- API en Node.js + Express
- Base de datos PostgreSQL
- Comunicación entre servicios por red privada
- Persistencia mediante volumen
- Orquestación con Docker Compose

---

# 1. Cómo ejecutar el proyecto

## Construir y levantar los servicios

```bash
docker compose up --build
```

O en segundo plano:

```bash
docker compose up -d --build
```

---

## API disponible en

```
http://localhost:3000
```

---

# 2. Endpoints disponibles

## GET /health

Endpoint de verificación de estado del servicio.

Probar con:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```

Respuesta:

```json
{"status":"ok","time":"2026-03-01T23:57:03.578Z"}
```

---

## GET /db/ping

Verifica la conexión con PostgreSQL ejecutando `SELECT NOW();`.

Probar con:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/db/ping -Method GET
```

---

## POST /todos

Crea una nueva tarea en la base de datos.

Probar con:

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/todos `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Tarea Docker Semana 4"}'
```

---

## GET /todos

Lista todas las tareas almacenadas.

Probar con:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/todos -Method GET
```

---

# 3. Evidencias

## Ver contenedores activos

```bash
docker compose ps
```

Debe mostrar algo similar a:

```
NAME                                IMAGE                             COMMAND                  SERVICE   CREATED         STATUS         PORTS
juan-felipe-restrepo-ospina-api-1   juan-felipe-restrepo-ospina-api   "docker-entrypoint.s…"   api       3 minutes ago   Up 3 minutes   0.0.0.0:3000->3000/tcp
juan-felipe-restrepo-ospina-db-1    postgres:15                       "docker-entrypoint.s…"   db        3 minutes ago   Up 3 minutes   5432/tcp
```

---

## Probar Health

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```

---

## Probar conexión a base de datos

```powershell
Invoke-RestMethod -Uri http://localhost:3000/db/ping -Method GET
```

---

## Crear un registro

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/todos `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Probando que escriba y lea"}'
```

---

## Listar registros

```powershell
Invoke-RestMethod -Uri http://localhost:3000/todos -Method GET
```

---

# 4. Evidencia de Persistencia

## Paso 1: Crear un registro

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/todos `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Probando persistencia"}'
```

## Paso 2: Apagar los servicios

```bash
docker compose down
```

## Paso 3: Levantar nuevamente

```bash
docker compose up -d
```

## Paso 4: Verificar que los datos siguen existiendo

```powershell
Invoke-RestMethod -Uri http://localhost:3000/todos -Method GET
```

Si los datos siguen apareciendo, la persistencia mediante volumen funciona correctamente.

---

# 5. Explicación Técnica

- La API se conecta a PostgreSQL usando el hostname del servicio `db`
- No se utiliza `localhost` para la conexión entre servicios
- Se define una red privada en `compose.yaml`
- PostgreSQL usa un volumen llamado `pgdata` para mantener los datos
- Todo el entorno se ejecuta dentro de contenedores Docker

---

# 6. Detener el proyecto

```bash
docker compose down
```

---

# Requisitos cumplidos

- Dockerfile para la API
- compose.yaml
- .dockerignore
- Persistencia con volumen
- Comunicación por red privada
- Endpoints funcionales
- Evidencias de ejecución