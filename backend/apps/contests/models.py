"""
Modelos de Competencias y Rankings.
CU5 — Gestionar Competencias
CU8 — Gestionar Ranking
"""

from django.db import models
from django.conf import settings


class Contest(models.Model):
    """Competencia de programación."""

    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('active', 'En curso'),
        ('finished', 'Finalizada'),
        ('cancelled', 'Cancelada'),
    ]

    SCORING_CHOICES = [
        ('icpc', 'ICPC (Penalización)'),
        ('ioi', 'IOI (Puntos parciales)'),
    ]

    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, default='', verbose_name='Descripción')
    start_time = models.DateTimeField(verbose_name='Fecha de inicio')
    end_time = models.DateTimeField(verbose_name='Fecha de fin')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Estado'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contests',
        verbose_name='Creado por'
    )
    is_public = models.BooleanField(default=True, verbose_name='Pública')
    scoring_type = models.CharField(
        max_length=10,
        choices=SCORING_CHOICES,
        default='icpc',
        verbose_name='Tipo de puntuación'
    )
    mode = models.CharField(
        max_length=20,
        choices=[('individual', 'Individual'), ('team', 'Por Equipos')],
        default='individual',
        verbose_name='Modalidad'
    )
    penalty_time = models.IntegerField(
        default=20,
        verbose_name='Penalización por intento fallido (min)'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'contests'
        verbose_name = 'Competencia'
        verbose_name_plural = 'Competencias'
        ordering = ['-start_time']

    def __str__(self):
        return self.title


class ContestProblem(models.Model):
    """Relación entre competencia y problema."""

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='contest_problems',
        verbose_name='Competencia'
    )
    problem = models.ForeignKey(
        'problems.Problem',
        on_delete=models.CASCADE,
        related_name='contest_problems',
        verbose_name='Problema'
    )
    label = models.CharField(max_length=5, verbose_name='Etiqueta (A, B, C...)')
    order = models.IntegerField(default=0, verbose_name='Orden')

    class Meta:
        db_table = 'contest_problems'
        verbose_name = 'Problema de competencia'
        verbose_name_plural = 'Problemas de competencia'
        unique_together = ('contest', 'problem')
        ordering = ['order']

    def __str__(self):
        return f"{self.contest.title} — {self.label}: {self.problem.title}"


class ContestParticipant(models.Model):
    """Participante registrado en una competencia."""

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='participants',
        verbose_name='Competencia'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='contest_participations',
        verbose_name='Usuario'
    )
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contest_participations',
        verbose_name='Equipo'
    )
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')

    class Meta:
        db_table = 'contest_participants'
        verbose_name = 'Participante'
        verbose_name_plural = 'Participantes'
        unique_together = ('contest', 'user')

    def __str__(self):
        return f"{self.user.username} en {self.contest.title}"


class Ranking(models.Model):
    """Ranking de una competencia."""

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='rankings',
        verbose_name='Competencia'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='rankings',
        verbose_name='Usuario'
    )
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rankings',
        verbose_name='Equipo'
    )
    solved_count = models.IntegerField(default=0, verbose_name='Problemas resueltos')
    total_penalty = models.IntegerField(default=0, verbose_name='Penalización total (min)')
    score = models.IntegerField(default=0, verbose_name='Puntaje')
    rank_position = models.IntegerField(default=0, verbose_name='Posición')
    last_accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último AC'
    )

    class Meta:
        db_table = 'rankings'
        verbose_name = 'Ranking'
        verbose_name_plural = 'Rankings'
        ordering = ['-solved_count', 'total_penalty']

    def __str__(self):
        return f"#{self.rank_position} {self.user.username} en {self.contest.title}"
