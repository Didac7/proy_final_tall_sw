"""
Modelos de Problemas y Banco de Problemas.
CU3 — Gestionar Problemas
CU4 — Gestionar Banco de Problemas
"""

from django.db import models
from django.conf import settings


class Problem(models.Model):
    """Problema de programación competitiva."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Fácil'),
        ('medium', 'Medio'),
        ('hard', 'Difícil'),
    ]

    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(verbose_name='Descripción')
    input_format = models.TextField(verbose_name='Formato de entrada')
    output_format = models.TextField(verbose_name='Formato de salida')
    sample_input = models.TextField(blank=True, default='', verbose_name='Entrada de ejemplo')
    sample_output = models.TextField(blank=True, default='', verbose_name='Salida de ejemplo')
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium',
        verbose_name='Dificultad'
    )
    time_limit_ms = models.IntegerField(default=2000, verbose_name='Límite de tiempo (ms)')
    memory_limit_kb = models.IntegerField(default=262144, verbose_name='Límite de memoria (KB)')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='authored_problems',
        verbose_name='Autor'
    )
    is_public = models.BooleanField(default=False, verbose_name='Público')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    tags = models.CharField(max_length=500, blank=True, default='', verbose_name='Etiquetas')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'problems'
        verbose_name = 'Problema'
        verbose_name_plural = 'Problemas'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.difficulty}] {self.title}"


class TestCase(models.Model):
    """Caso de prueba para un problema."""

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name='test_cases',
        verbose_name='Problema'
    )
    input_data = models.TextField(verbose_name='Datos de entrada')
    expected_output = models.TextField(verbose_name='Salida esperada')
    is_sample = models.BooleanField(default=False, verbose_name='Es ejemplo')
    order = models.IntegerField(default=0, verbose_name='Orden')

    class Meta:
        db_table = 'test_cases'
        verbose_name = 'Caso de prueba'
        verbose_name_plural = 'Casos de prueba'
        ordering = ['order']

    def __str__(self):
        return f"TC#{self.order} — {self.problem.title}"
