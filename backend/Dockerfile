# Usa una imagen oficial de Node.js (elige la versión de tu proyecto)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/server

# Copia el package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos de tu aplicación
COPY . .

# Expone el puerto en el que corre tu app
EXPOSE 10000 
# (Render ignorará esto y usará su variable PORT, pero es una buena práctica)

# El comando para iniciar la aplicación
CMD [ "npm", "start" ]