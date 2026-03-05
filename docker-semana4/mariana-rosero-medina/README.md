# Taller de Microservicios con Docker y Node.js

Este proyecto demuestra la creación y orquestación de una API en Node.js conectada a una base de datos PostgreSQL utilizando Docker y Docker Compose.

## Cómo ejecutar

Para levantar la API y la base de datos por primera vez, o para reconstruir las imágenes, ejecuta el siguiente comando en la terminal (ubicado en la raíz del proyecto):

\`\`\`bash
docker compose up --build -d
\`\`\`

## URL de la API y Endpoints

Una vez que los contenedores estén corriendo, la API estará disponible localmente en `http://localhost:3000`.

### Endpoints implementados:

* **Verificar el estado del servidor:**
  \`\`\`bash
  curl http://localhost:3000/health
  \`\`\`

* **Probar la conexión con la base de datos:**
  \`\`\`bash
  curl http://localhost:3000/db/ping
  \`\`\`

* **Crear una nueva tarea en la base de datos:**
  \`\`\`bash
  curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d "{\"title\":\"Completar mi taller de microservicios\"}"
  \`\`\`

* **Listar todas las tareas:**
  \`\`\`bash
  curl http://localhost:3000/todos
  \`\`\`

---

## Evidencias

1. **Contenedores en ejecución:** *(Comando: docker compose ps)*
   ![Evidencia 1 - Contenedores](/capturas/captura-1.png)

2. **Prueba de la API Node.js:** *(Comando: curl http://localhost:3000/health)*
   ![Evidencia 2 - Health](/capturas/captura-2.png)

3. **Comunicación en la red privada:** *(Comando: curl http://localhost:3000/db/ping)*
   ![Evidencia 3 - DB Ping](/capturas/captura-3.png)

4. **Gestión de tareas (Crear y Listar):** *(Comandos POST y GET a /todos)*
   ![Evidencia 4 - Crear Tareas](/capturas/captura-4.png) 
   ![Evidencia  - Listar Tareas](/capturas/captura-5.png) 
---

## Evidencia de Persistencia de Datos

1. Se levantaron los servicios y se crearon tareas.
2. Se bajaron los contenedores con `docker compose down` (conservando el volumen).
3. Se volvieron a levantar con `docker compose up --build -d`.
4. Se verificó que los datos seguían ahí ejecutando nuevamente el GET a `/todos`:
   ![Evidencia 5 - Persistencia](/capturas/captura-8.png)

---

## FAQ (Preguntas Frecuentes)

### ¿Qué significa \`depends_on\` y qué NO garantiza?
> *(depends_on  le dice a Docker que encienda el contenedor de la base de datos primero, y luego el de la API. Sin embargo,  depends_on sólo garantiza que el contenedor arranque, pero no garantiza que el programa adentro (en este caso PostgreSQL) ya esté listo. De esta forma, al no tener el programa funcionando, la API falla y se apaga. Integrando la línea de código restart: on-failure, cuando la API falle, Docker la reiniciará, dándole tiempo a PostgreSQL para estar listo. )*

### ¿Cómo funciona el DNS interno de Docker?
> *(Cuando se crea la red privada en el archivo compose.yaml, Docker enciende automáticamente un servidor DNS. Este facilita el descubrimiento automático de servicios y la comunicación entre contenedores por su nombre. De este modo, los contenedores no necesitan saber sus direcciones IP exactas (las cuales cambian cada que se apagan y encienden) para conectarse.)*

### ¿Cuál es la diferencia entre volumen y bind mount?
> *(Aunque ambos sirven para guardar datos fuera del contenedor, evitando que estos se borren; Bind Mount es un enlace directo específico a una carpeta dentro de la computadora, la cual queda conectada al contenedor. Mientras que con el Volumen, Docker crea un espacio oculto y protegido que él mismo administra, haciéndolo una opción más segura y  recomendada para bases de datos, porque no depende de ningún sistema operativo)*