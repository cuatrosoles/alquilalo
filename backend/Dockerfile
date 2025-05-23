FROM node:16-alpine

WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto
EXPOSE 10000

# Inicia la aplicación
CMD ["node", "src/server.js"]