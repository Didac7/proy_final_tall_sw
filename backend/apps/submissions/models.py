"""
Modelos de Envíos.
CU6 — Gestionar Envíos
CU7 — Gestionar Revisión de Soluciones
"""

from django.db import models
from django.conf import settings


class Submission(models.Model):
    """Envío de solución a un problema."""

    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('java', 'Java'),
    ]

    VERDICT_CHOICES = [
        ('pending', 'Pendiente'),
        ('AC', 'Accepted'),
        ('WA', 'Wrong Answer'),
        ('TLE', 'Time Limit Exceeded'),
        ('RE', 'Runtime Error'),
        ('CE', 'Compilation Error'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='Usuario'
    )
    problem = models.ForeignKey(
        'problems.Problem',
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='Problema'
    )
    contest = models.ForeignKey(
        'contests.Contest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submissions',
        verbose_name='Competencia'
    )
    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        verbose_name='Lenguaje'
    )
    source_code = models.TextField(verbose_name='Código fuente')
    verdict = models.CharField(
        max_length=10,
        choices=VERDICT_CHOICES,
        default='pending',
        verbose_name='Veredicto'
    )
    execution_time_ms = models.IntegerField(
        default=0,
        verbose_name='Tiempo de ejecución (ms)'
    )
    memory_used_kb = models.IntegerField(
        default=0,
        verbose_name='Memoria usada (KB)'
    )
    error_message = models.TextField(
        blank=True,
        default='',
        verbose_name='Mensaje de error'
    )
    test_cases_passed = models.IntegerField(
        default=0,
        verbose_name='Casos de prueba pasados'
    )
    total_test_cases = models.IntegerField(
        default=0,
        verbose_name='Total de casos de prueba'
    )
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de envío')

    class Meta:
        db_table = 'submissions'
        verbose_name = 'Envío'
        verbose_name_plural = 'Envíos'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.username} — {self.problem.title} — {self.verdict}"
