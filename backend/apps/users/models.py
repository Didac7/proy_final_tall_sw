"""
Modelos de Usuarios y Roles.
CU1 — Gestionar Roles
CU2 — Gestionar Usuarios
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """Roles del sistema: admin, coach, student."""

    ADMIN = 'admin'
    COACH = 'coach'
    STUDENT = 'student'

    ROLE_CHOICES = [
        (ADMIN, 'Administrador'),
        (COACH, 'Coach'),
        (STUDENT, 'Estudiante'),
    ]

    name = models.CharField(
        max_length=50,
        unique=True,
        choices=ROLE_CHOICES,
        verbose_name='Nombre del rol'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Descripción'
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'roles'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['name']

    def __str__(self):
        return self.get_name_display()


class Permission(models.Model):
    """Permisos granulares para control de acceso."""

    codename = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Código del permiso'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Descripción'
    )

    class Meta:
        db_table = 'custom_permissions'
        verbose_name = 'Permiso'
        verbose_name_plural = 'Permisos'
        ordering = ['codename']

    def __str__(self):
        return self.codename


class RolePermission(models.Model):
    """Relación muchos a muchos entre roles y permisos."""

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_permissions',
        verbose_name='Rol'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='role_permissions',
        verbose_name='Permiso'
    )

    class Meta:
        db_table = 'role_permissions'
        verbose_name = 'Permiso de rol'
        verbose_name_plural = 'Permisos de roles'
        unique_together = ('role', 'permission')

    def __str__(self):
        return f"{self.role} — {self.permission}"


class User(AbstractUser):
    """
    Modelo de usuario extendido.
    Incluye relación con rol y campos adicionales para el perfil.
    """

    email = models.EmailField(
        unique=True,
        verbose_name='Correo electrónico'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name='Rol'
    )
    university = models.CharField(
        max_length=200,
        blank=True,
        default='UAGRM',
        verbose_name='Universidad'
    )
    faculty = models.CharField(
        max_length=200,
        blank=True,
        default='FICCT',
        verbose_name='Facultad'
    )
    bio = models.TextField(
        blank=True,
        default='',
        verbose_name='Biografía'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"

    @property
    def role_name(self):
        """Retorna el nombre del rol o 'sin_rol'."""
        return self.role.name if self.role else 'sin_rol'

    @property
    def is_admin(self):
        return self.role and self.role.name == Role.ADMIN

    @property
    def is_coach(self):
        return self.role and self.role.name == Role.COACH

    @property
    def is_student(self):
        return self.role and self.role.name == Role.STUDENT
