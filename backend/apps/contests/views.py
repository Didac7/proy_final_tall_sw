"""
Vistas de Competencias y Rankings.
CU5 — Gestionar Competencias
CU8 — Gestionar Ranking
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Contest, ContestProblem, ContestParticipant, Ranking
from .serializers import (
    ContestListSerializer,
    ContestDetailSerializer,
    ContestCreateSerializer,
    ContestProblemSerializer,
    ContestParticipantSerializer,
    RankingSerializer,
)
from apps.users.permissions import IsCoachOrAdmin


class ContestViewSet(viewsets.ModelViewSet):
    """CRUD de competencias con acciones extra para registro, problemas y ranking."""

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_public', 'scoring_type']
    search_fields = ['title', 'description']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['-start_time']

    def get_queryset(self):
        from django.utils import timezone
        now = timezone.now()
        
        # 1. Competencias que deberían estar activas (start_time <= now < end_time) y están como 'pending'
        Contest.objects.filter(
            start_time__lte=now,
            end_time__gt=now,
            status='pending'
        ).update(status='active')
        
        # 2. Competencias que deberían estar finalizadas (end_time <= now) y están como 'pending' o 'active'
        Contest.objects.filter(
            end_time__lte=now,
            status__in=['pending', 'active']
        ).update(status='finished')
        
        # 3. Competencias que deberían estar pendientes (start_time > now) y están como 'active'
        Contest.objects.filter(
            start_time__gt=now,
            status='active'
        ).update(status='pending')

        user = self.request.user
        if user.is_admin or user.is_coach:
            return Contest.objects.all()
        return Contest.objects.filter(is_public=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return ContestListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ContestCreateSerializer
        return ContestDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsCoachOrAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Registrar al usuario autenticado en la competencia."""
        contest = self.get_object()

        if contest.status == 'finished':
            return Response(
                {'error': 'La competencia ya finalizó.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        participant, created = ContestParticipant.objects.get_or_create(
            contest=contest,
            user=request.user,
            defaults={'team': None}
        )

        if not created:
            return Response(
                {'message': 'Ya estás registrado en esta competencia.'},
                status=status.HTTP_200_OK
            )

        # Crear entrada de ranking
        Ranking.objects.get_or_create(
            contest=contest,
            user=request.user,
        )

        return Response(
            {'message': 'Registrado exitosamente.'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def ranking(self, request, pk=None):
        """Obtener ranking de la competencia (soporta polling)."""
        contest = self.get_object()
        rankings = Ranking.objects.filter(contest=contest).select_related('user', 'team')
        serializer = RankingSerializer(rankings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def problems(self, request, pk=None):
        """Listar o agregar problemas a una competencia."""
        contest = self.get_object()

        if request.method == 'GET':
            contest_problems = ContestProblem.objects.filter(
                contest=contest
            ).select_related('problem')
            serializer = ContestProblemSerializer(contest_problems, many=True)
            return Response(serializer.data)

        # POST — agregar problema (solo coach/admin)
        if not (request.user.is_admin or request.user.is_coach):
            return Response(
                {'error': 'No tiene permisos.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ContestProblemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(contest=contest)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Listar participantes de la competencia."""
        contest = self.get_object()
        participants = ContestParticipant.objects.filter(
            contest=contest
        ).select_related('user', 'team')
        serializer = ContestParticipantSerializer(participants, many=True)
        return Response(serializer.data)
