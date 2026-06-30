"""
Permisos personalizados para control de acceso basado en roles.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Solo permite acceso a administradores."""
    message = 'Se requiere rol de administrador.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsCoachOrAdmin(BasePermission):
    """Permite acceso a coaches y administradores."""
    message = 'Se requiere rol de coach o administrador.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin or request.user.is_coach)
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Permite acceso si el usuario es dueño del recurso o es admin.
    El objeto debe tener un atributo 'user', 'created_by' o 'coach'.
    """
    message = 'Solo puedes acceder a tus propios recursos o equipos.'

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        # Buscar campo de usuario en el objeto
        user_field = getattr(obj, 'user', None) or getattr(obj, 'created_by', None) or getattr(obj, 'coach', None)
        return user_field == request.user


class IsAuthenticatedAndActive(BasePermission):
    """Verifica que el usuario esté autenticado y activo."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        )


class IsCoach(BasePermission):
    """Solo permite acceso a entrenadores (coaches)."""
    message = 'Se requiere rol de coach.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_coach
        )
