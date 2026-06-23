# Etapa 1: Construcción de la aplicación React
FROM node:20-alpine AS build

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Compila la build de producción
RUN npm run build

# Etapa 2: Servidor Web Nginx de producción
FROM nginx:stable-alpine

# Elimina los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia la build de React compilada desde la etapa 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
