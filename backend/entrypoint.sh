#!/bin/sh

# Si se usa PostgreSQL, esperar a que esté listo antes de arrancar Django
if [ "$DB_HOST" = "db" ] || [ -n "$DB_HOST" ]; then
    echo "Esperando a la base de datos en $DB_HOST:$DB_PORT..."
    while ! nc -z $DB_HOST ${DB_PORT:-5432}; do
      sleep 0.5
    done
    echo "Base de datos lista!"
fi

# Aplicar migraciones
echo "Aplicando migraciones..."
python manage.py migrate --noinput

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Arrancar la aplicación con Gunicorn en producción
echo "Iniciando Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
