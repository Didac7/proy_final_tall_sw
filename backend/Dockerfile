# Usa una imagen oficial de Python ligera
FROM python:3.10-slim

# Evita que Python escriba archivos .pyc y fuerza que la salida de log se muestre inmediatamente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo
WORKDIR /app

# Instala dependencias del sistema requeridas para compilar psycopg2 y otras herramientas básicas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala los requerimientos
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copia el código fuente
COPY . /app/

# Da permisos de ejecución al script de entrada
RUN chmod +x /app/entrypoint.sh

# Puerto por defecto expuesto
EXPOSE 8000

# Punto de entrada
ENTRYPOINT ["/app/entrypoint.sh"]
