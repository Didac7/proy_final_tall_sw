"""
Modelos de Entrenamientos.
CU10 — Gestionar Entrenamientos
"""
from django.db import models
from django.conf import settings


class Training(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('active', 'Activo'),
        ('finished', 'Finalizado'),
    ]

    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, default='', verbose_name='Descripción')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_trainings', verbose_name='Creado por'
    )
    start_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de inicio')
    end_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de fin')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Estado')
    is_public = models.BooleanField(default=True, verbose_name='Público')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        db_table = 'trainings'
        verbose_name = 'Entrenamiento'
        verbose_name_plural = 'Entrenamientos'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class TrainingProblem(models.Model):
    training = models.ForeignKey(
        Training, on_delete=models.CASCADE,
        related_name='training_problems', verbose_name='Entrenamiento'
    )
    problem = models.ForeignKey(
        'problems.Problem', on_delete=models.CASCADE,
        related_name='training_problems', verbose_name='Problema'
    )
    order = models.IntegerField(default=0, verbose_name='Orden')

    class Meta:
        db_table = 'training_problems'
        verbose_name = 'Problema de entrenamiento'
        verbose_name_plural = 'Problemas de entrenamiento'
        unique_together = ('training', 'problem')
        ordering = ['order']

    def __str__(self):
        return f"{self.training.title} — {self.problem.title}"
