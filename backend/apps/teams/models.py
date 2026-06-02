"""
Modelos de Equipos.
CU9 — Gestionar Equipos
"""

from django.db import models
from django.conf import settings


class Team(models.Model):
    """Equipo de programación competitiva."""

    name = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coached_teams',
        verbose_name='Coach'
    )
    description = models.TextField(blank=True, default='', verbose_name='Descripción')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'teams'
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.members.count()


class TeamMember(models.Model):
    """Miembro de un equipo."""

    ROLE_CHOICES = [
        ('leader', 'Líder'),
        ('member', 'Miembro'),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='Equipo'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='team_memberships',
        verbose_name='Usuario'
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='member',
        verbose_name='Rol en equipo'
    )
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de ingreso')

    class Meta:
        db_table = 'team_members'
        verbose_name = 'Miembro de equipo'
        verbose_name_plural = 'Miembros de equipo'
        unique_together = ('team', 'user')

    def __str__(self):
        return f"{self.user.username} en {self.team.name}"
