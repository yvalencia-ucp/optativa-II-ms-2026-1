# 1. Usamos una imagen oficial de Node liviana como base
FROM node:18-alpine

# 2. Creamos una carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos el package.json y package-lock.json (si existe)
COPY package*.json ./

# 4. Instalamos las dependencias (Express y pg)
RUN npm install

# 5. Copiamos el resto de nuestro código (el server.js)
COPY . .

# 6. Le decimos a Docker qué puerto usa nuestra app
EXPOSE 3000

# 7. El comando para encender el servidor
CMD ["node", "server.js"]