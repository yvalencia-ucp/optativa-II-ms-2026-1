# 1. Usar una imagen base oficial de Node.js que sea ligera
FROM node:18-alpine

# 2. Establecer la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar primero los archivos de dependencias
COPY package*.json ./

# 4. Instalar las dependencias (Express y pg) adentro del contenedor
RUN npm install

# 5. Copiar el resto de tu código (como el server.js)
COPY . .

# 6. Exponer el puerto donde escucha nuestra API
EXPOSE 3000

# 7. El comando final para encender el servidor
CMD ["node", "server.js"]