# Usa una imagen base de Node.js 16
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --only=production

# Copia el resto de la aplicación
COPY . .

# Expone el puerto
EXPOSE 10000

# Inicia la aplicación
CMD ["node", "src/server.js"]