# Docker (Semana 4) — Cheat Sheet con explicación (para el taller)

Este cheat sheet está pensado para que puedas **levantar, depurar y entender** el proyecto del taller: API + Postgres con red privada y volumen.

---

## 1) Conceptos rápidos (con una frase)
- **Imagen**: plantilla inmutable con tu app + dependencias (se construye con `docker build`).
- **Contenedor**: instancia en ejecución de una imagen (se crea con `docker run` o `docker compose up`).
- **Dockerfile**: receta paso a paso para construir una imagen.
- **Registry**: lugar donde viven imágenes (Docker Hub, GHCR).
- **Red**: permite que contenedores se hablen por nombre.
- **Volumen**: almacenamiento persistente (sobrevive a `down`/`rm`).

---

## 2) Comandos base (Docker)
### Ver estado
- `docker ps` → contenedores activos
- `docker ps -a` → activos + detenidos
- `docker images` → imágenes locales
- `docker volume ls` → volúmenes
- `docker network ls` → redes

### Logs y debugging
- `docker logs <container>` → ver salida
- `docker logs -f <container>` → seguir logs en vivo
- `docker exec -it <container> sh` → entrar al contenedor (o `bash` si existe)

### Crear/limpiar
- `docker stop <container>`
- `docker rm <container>`
- `docker rmi <image>`
- `docker system df` → uso de disco por Docker
- `docker system prune` → limpia recursos no usados (**cuidado**)

---

## 3) Build & Run (una sola app)
### Construir imagen (desde carpeta con Dockerfile)
- `docker build -t mi-api:dev .`

**Explicación:**  
`-t` asigna un nombre:tag a la imagen. El `.` es el “contexto”: los archivos que Docker puede usar para construir.

### Correr contenedor con puertos y variables
- `docker run --name api -p 3000:3000 -e PORT=3000 mi-api:dev`

**Explicación:**  
`-p host:container` publica el puerto del contenedor al host. `-e` define variables de entorno.

---

## 4) Redes (por qué NO es localhost)
### Crear red
- `docker network create micro-net`

### Correr dos contenedores en la misma red
- `docker run -d --name db --network micro-net postgres:16`
- `docker run -it --rm --network micro-net alpine sh`

**Explicación:**  
En la red `micro-net`, Docker crea DNS interno: el contenedor `db` es resoluble por nombre `db`.  
Dentro de un contenedor, `localhost` apunta **a ese mismo contenedor**, no al host ni a otro servicio.

---

## 5) Volúmenes (persistencia)
### Crear volumen y montarlo
- `docker volume create pgdata`
- `docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16`

**Explicación:**  
Postgres guarda datos en `/var/lib/postgresql/data`. Al montar un volumen ahí, los datos quedan fuera del ciclo de vida del contenedor.

---

## 6) Docker Compose (lo que usarás en el taller)
### Comandos esenciales
- `docker compose up --build` → construye lo necesario y levanta servicios
- `docker compose down` → baja servicios (por defecto **no** borra volúmenes nombrados)
- `docker compose ps` → ver estado
- `docker compose logs -f` → logs de todos los servicios
- `docker compose exec api sh` → entrar al contenedor de `api`
- `docker compose exec db psql -U postgres` → entrar a Postgres (si `psql` existe en la imagen)

### Reconstruir cuando cambias código
- `docker compose up --build` (recomendada)
- o `docker compose build api` y luego `docker compose up`

---

## 7) compose.yaml — plantilla mínima (orientativa)
> Ajusta puertos, variables y paths según tu proyecto.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - micro-net
    ports:
      - "5432:5432"

  api:
    build:
      context: ./api
    environment:
      DB_HOST: db
      DB_PORT: "5432"
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: appdb
      PORT: "3000"
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - micro-net

volumes:
  pgdata:

networks:
  micro-net:
```

**Claves importantes:**
- `DB_HOST: db` → el hostname es el nombre del servicio en Compose.
- `volumes: pgdata:` → volumen nombrado (persistente).
- `networks: micro-net` → red compartida para comunicación interna.

---

## 8) Curl rápido (para evidencias)
- `curl http://localhost:3000/health`
- `curl http://localhost:3000/db/ping`
- Crear todo:
  - `curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"title":"Estudiar Docker"}'`
- Listar:
  - `curl http://localhost:3000/todos`

---

## 9) Diagnóstico rápido de fallos
### “Port already in use”
- Cambia el puerto del host: `-p 3001:3000` o en Compose `"3001:3000"`

### API no conecta a DB
- Verifica:
  - ¿`DB_HOST` es `db`?
  - ¿Ambos servicios están en la misma red?
  - `docker compose logs -f db` (¿Postgres arrancó?)
  - `docker compose exec api sh` y prueba `ping db` (si existe) o `nslookup db` (si está disponible)

### Persistencia no funciona
- Revisa que el volumen esté definido y montado:
  - `docker volume ls`
  - `docker inspect <container>` (busca “Mounts”)
- Asegúrate de usar **volumen nombrado**, no un contenedor sin volumen.

---

## 10) Buenas prácticas mínimas (para tu Dockerfile)
- Usar imágenes slim/alpine cuando sea razonable
- Añadir `.dockerignore` (por ejemplo: `node_modules`, `.git`, `dist`)
- Copiar `package*.json` antes de copiar el resto (cache)
- Preferir `npm ci` si existe `package-lock.json`

---

## 11) Mini-glosario (para el README de entrega)
- **Build**: construir la imagen desde Dockerfile
- **Run/Up**: crear contenedor(es) y arrancarlos
- **Down**: detener y remover contenedores/redes del proyecto (no siempre borra volúmenes)
- **Bind mount**: monta una carpeta del host (útil en dev)
- **Volume**: almacenamiento gestionado por Docker (mejor para DB)

