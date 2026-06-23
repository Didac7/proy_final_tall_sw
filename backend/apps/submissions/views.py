"""
Vistas de Envíos.
CU6 — Gestionar Envíos
CU7 — Gestionar Revisión de Soluciones
"""

from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Submission
from .serializers import (
    SubmissionListSerializer,
    SubmissionDetailSerializer,
    SubmissionCreateSerializer,
)
from apps.users.permissions import IsAdmin, IsOwnerOrAdmin
from apps.judge.ai_judge import evaluate_submission_with_ai
from apps.contests.models import Ranking


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    Gestión de envíos.
    - Crear: cualquier usuario autenticado
    - Listar: admin ve todos, usuario normal ve los suyos
    - Detalle: solo el dueño o admin
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['verdict', 'language', 'problem', 'contest', 'user']
    ordering_fields = ['submitted_at', 'execution_time_ms']
    ordering = ['-submitted_at']
    http_method_names = ['get', 'post', 'head', 'options']  # No permitir PUT/DELETE

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_coach:
            return Submission.objects.select_related('user', 'problem', 'contest').all()
        return Submission.objects.select_related(
            'user', 'problem', 'contest'
        ).filter(user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return SubmissionCreateSerializer
        if self.action == 'retrieve':
            return SubmissionDetailSerializer
        return SubmissionListSerializer

    def create(self, request, *args, **kwargs):
        """Crear envío y ejecutar evaluación automática."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Crear el submission
        submission = Submission.objects.create(
            user=request.user,
            **serializer.validated_data
        )

        # Ejecutar evaluación
        result = evaluate_submission_with_ai(submission)

        # Actualizar submission con resultado
        submission.verdict = result.verdict
        submission.execution_time_ms = result.execution_time_ms
        submission.memory_used_kb = result.memory_used_kb
        submission.error_message = result.error_message
        submission.ai_feedback = result.ai_feedback
        submission.test_cases_passed = result.test_cases_passed
        submission.total_test_cases = result.total_test_cases
        submission.save()

        # Actualizar ranking si es parte de una competencia
        if submission.contest and result.verdict == 'AC':
            self._update_ranking(submission)

        # Retornar resultado
        return Response(
            SubmissionDetailSerializer(submission).data,
            status=status.HTTP_201_CREATED
        )

    def _update_ranking(self, submission):
        """Actualizar ranking de la competencia tras un AC."""
        try:
            ranking, _ = Ranking.objects.get_or_create(
                contest=submission.contest,
                user=submission.user,
            )

            # Contar problemas únicos resueltos en esta competencia
            solved = Submission.objects.filter(
                user=submission.user,
                contest=submission.contest,
                verdict='AC'
            ).values('problem').distinct().count()

            # Calcular penalización total (intentos fallidos * penalty_time)
            penalty = 0
            solved_problems = Submission.objects.filter(
                user=submission.user,
                contest=submission.contest,
                verdict='AC'
            ).values_list('problem_id', flat=True).distinct()

            for problem_id in solved_problems:
                # Contar intentos fallidos antes del primer AC
                first_ac = Submission.objects.filter(
                    user=submission.user,
                    contest=submission.contest,
                    problem_id=problem_id,
                    verdict='AC'
                ).order_by('submitted_at').first()

                if first_ac:
                    failed_attempts = Submission.objects.filter(
                        user=submission.user,
                        contest=submission.contest,
                        problem_id=problem_id,
                        submitted_at__lt=first_ac.submitted_at,
                        verdict__in=['WA', 'TLE', 'RE']
                    ).count()

                    penalty += failed_attempts * submission.contest.penalty_time

                    # Tiempo desde inicio de la competencia
                    time_diff = first_ac.submitted_at - submission.contest.start_time
                    penalty += int(time_diff.total_seconds() / 60)

            ranking.solved_count = solved
            ranking.total_penalty = penalty
            ranking.last_accepted_at = submission.submitted_at
            ranking.save()

            # Recalcular posiciones
            self._recalculate_positions(submission.contest)

        except Exception:
            pass  # No fallar la respuesta por error en ranking

    def _recalculate_positions(self, contest):
        """Recalcular posiciones del ranking."""
        rankings = Ranking.objects.filter(
            contest=contest
        ).order_by('-solved_count', 'total_penalty')

        for i, ranking in enumerate(rankings, 1):
            ranking.rank_position = i
            ranking.save(update_fields=['rank_position'])
