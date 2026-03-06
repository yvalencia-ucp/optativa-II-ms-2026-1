# Salida de `docker compose ps`

node_api      giovanny-orozco-api   "docker-entrypoint.s…"   api       6 hours ago   Up 6 hours   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
postgres_db   postgres:15-alpine    "docker-entrypoint.s…"   db        6 hours ago   Up 6 hours   5432/tcp



# Salida de la consulta de la api con el endpoint http://localhost:3000/health

{"status":"ok","server_time":"2026-03-05T23:27:44.999Z"}



# salida de la consulta de la api con el endpoint http://localhost:3000/db/ping

{"status":"connected","db_time":"2026-03-05T23:28:48.647Z"}



# salida de la petición de tipo POST de la api con el endpoint http://localhost:3000/todos

- Ejecución de una petición HTTP POST para la inserción de un nuevo registro en la tabla todos utilizando el cliente cURL:

  curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"title": "Terminar mi tarea de Docker", "done": false}'

- La API procesa la solicitud y retorna una respuesta exitosa (HTTP 201) con el objeto JSON del registro creado, incluyendo el 
  id autogenerado y la marca de tiempo (created_at) de la base de datos:

  {"id":1,"title":"Terminar mi tarea de Docker","done":false,"created_at":"2026-03-05T23:32:43.434Z"}



# salida de la petición de tipo GET de la api con el endpoint https://localhost:3000/todos

  [{"id":1,"title":"Terminar mi tarea de Docker","done":false,"created_at":"2026-03-05T23:32:43.434Z"}]

  Ejecución de una petición HTTP GET para verificar la persistencia de los datos. El servidor retorna la colección completa de tareas almacenadas en PostgreSQL, incluyendo el registro insertado previamente: