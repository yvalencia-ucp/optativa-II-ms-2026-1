FROM node:24-alpine

WORKDIR /app

# Copiar archivos de dependencias para aprovechar el caché
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
