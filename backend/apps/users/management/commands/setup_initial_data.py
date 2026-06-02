"""
Comando para crear datos iniciales: roles y superusuario admin.
"""
from django.core.management.base import BaseCommand
from apps.users.models import Role, User


class Command(BaseCommand):
    help = 'Crear roles iniciales y superusuario administrador'

    def handle(self, *args, **options):
        # Crear roles
        roles_data = [
            ('admin', 'Administrador del sistema con acceso total.'),
            ('coach', 'Coach/entrenador que gestiona equipos y competencias.'),
            ('student', 'Estudiante participante en competencias y entrenamientos.'),
        ]

        for name, description in roles_data:
            role, created = Role.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            status = 'CREADO' if created else 'ya existe'
            self.stdout.write(f'  Rol "{role.get_name_display()}": {status}')

        # Crear superusuario admin
        admin_role = Role.objects.get(name='admin')
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='admin@uagrm.edu.bo',
                password='admin123',
                first_name='Administrador',
                last_name='ICPC',
                role=admin_role,
            )
            self.stdout.write(self.style.SUCCESS(
                f'\n  Superusuario creado: admin / admin123'
            ))
        else:
            self.stdout.write('  Superusuario "admin" ya existe.')

        self.stdout.write(self.style.SUCCESS('\n✅ Datos iniciales creados exitosamente.'))
