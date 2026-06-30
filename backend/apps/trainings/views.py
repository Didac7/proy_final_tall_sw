"""Vistas de Entrenamientos. CU10 — Gestionar Entrenamientos"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Training, TrainingProblem
from .serializers import (
    TrainingListSerializer, TrainingDetailSerializer,
    TrainingCreateSerializer, TrainingProblemSerializer,
)
from apps.users.permissions import IsCoach
from apps.submissions.models import Submission


class TrainingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'is_public']
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_coach:
            return Training.objects.all()
        return Training.objects.filter(is_public=True, status='active')

    def get_serializer_class(self):
        if self.action == 'list':
            return TrainingListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return TrainingCreateSerializer
        return TrainingDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_problem']:
            return [IsAuthenticated(), IsCoach()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def add_problem(self, request, pk=None):
        training = self.get_object()
        problem_id = request.data.get('problem_id')
        order = request.data.get('order', 0)
        if not problem_id:
            return Response({'error': 'problem_id requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        tp, created = TrainingProblem.objects.get_or_create(
            training=training, problem_id=problem_id, defaults={'order': order}
        )
        if not created:
            return Response({'message': 'Problema ya agregado.'}, status=status.HTTP_200_OK)
        return Response(TrainingProblemSerializer(tp).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Progreso del usuario en el entrenamiento."""
        training = self.get_object()
        problems = training.training_problems.select_related('problem').all()
        results = []
        for tp in problems:
            has_ac = Submission.objects.filter(
                user=request.user, problem=tp.problem, verdict='AC'
            ).exists()
            results.append({
                'problem_id': tp.problem.id,
                'problem_title': tp.problem.title,
                'order': tp.order,
                'solved': has_ac,
            })
        total = len(results)
        solved = sum(1 for r in results if r['solved'])
        return Response({
            'total': total,
            'solved': solved,
            'percentage': round(solved / total * 100, 1) if total > 0 else 0,
            'problems': results,
        })
