# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Crea un usuario no root
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Establece el directorio de trabajo
WORKDIR /usr/src/server

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos
COPY --chown=nodejs:nodejs . .

# Cambia al usuario no root
USER nodejs

# Expone el puerto
EXPOSE 10000

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]