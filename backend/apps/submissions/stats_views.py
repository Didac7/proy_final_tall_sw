"""
Vistas de estadísticas globales y por usuario.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User
from apps.problems.models import Problem
from apps.contests.models import Contest
from apps.submissions.models import Submission
from apps.teams.models import Team
from apps.trainings.models import Training
from apps.users.permissions import IsAdmin


class GlobalStatsView(APIView):
    """Estadísticas globales del sistema (admin)."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)

        # Conteos generales
        total_users = User.objects.filter(is_active=True).count()
        total_problems = Problem.objects.filter(is_active=True).count()
        total_contests = Contest.objects.count()
        total_submissions = Submission.objects.count()
        total_teams = Team.objects.filter(is_active=True).count()
        total_trainings = Training.objects.count()

        # Envíos últimos 7 días
        submissions_last_7 = Submission.objects.filter(
            submitted_at__gte=last_7_days
        ).count()

        # Usuarios nuevos últimos 30 días
        new_users_30 = User.objects.filter(
            created_at__gte=last_30_days
        ).count()

        # Distribución de veredictos (global)
        verdict_distribution = list(
            Submission.objects.values('verdict')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Envíos por día (últimos 14 días)
        submissions_by_day = list(
            Submission.objects.filter(submitted_at__gte=now - timedelta(days=14))
            .annotate(date=TruncDate('submitted_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        # Convertir date a string
        for item in submissions_by_day:
            item['date'] = item['date'].isoformat()

        # Problemas por dificultad
        problems_by_difficulty = list(
            Problem.objects.filter(is_active=True)
            .values('difficulty')
            .annotate(count=Count('id'))
            .order_by('difficulty')
        )

        # Top 5 problemas más resueltos
        top_solved = list(
            Submission.objects.filter(verdict='AC')
            .values('problem__id', 'problem__title')
            .annotate(solve_count=Count('user', distinct=True))
            .order_by('-solve_count')[:5]
        )

        # Top 5 usuarios con más AC
        top_users = list(
            Submission.objects.filter(verdict='AC')
            .values('user__id', 'user__username', 'user__first_name', 'user__last_name')
            .annotate(ac_count=Count('id'))
            .order_by('-ac_count')[:5]
        )

        # Distribución de lenguajes
        language_distribution = list(
            Submission.objects.values('language')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Competencias activas
        active_contests = Contest.objects.filter(status='active').count()

        return Response({
            'overview': {
                'total_users': total_users,
                'total_problems': total_problems,
                'total_contests': total_contests,
                'total_submissions': total_submissions,
                'total_teams': total_teams,
                'total_trainings': total_trainings,
                'submissions_last_7_days': submissions_last_7,
                'new_users_last_30_days': new_users_30,
                'active_contests': active_contests,
            },
            'charts': {
                'verdict_distribution': verdict_distribution,
                'submissions_by_day': submissions_by_day,
                'problems_by_difficulty': problems_by_difficulty,
                'language_distribution': language_distribution,
            },
            'rankings': {
                'top_solved_problems': top_solved,
                'top_users': top_users,
            },
        })


class UserStatsView(APIView):
    """Estadísticas del usuario autenticado."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()

        # Envíos totales del usuario
        total_submissions = Submission.objects.filter(user=user).count()
        ac_submissions = Submission.objects.filter(user=user, verdict='AC').count()

        # Tasa de acierto
        acceptance_rate = round(
            (ac_submissions / total_submissions * 100) if total_submissions > 0 else 0, 1
        )

        # Problemas únicos resueltos
        unique_solved = Submission.objects.filter(
            user=user, verdict='AC'
        ).values('problem').distinct().count()

        # Distribución de veredictos del usuario
        verdict_distribution = list(
            Submission.objects.filter(user=user)
            .values('verdict')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Envíos por día (últimos 30 días)
        submissions_by_day = list(
            Submission.objects.filter(
                user=user,
                submitted_at__gte=now - timedelta(days=30)
            )
            .annotate(date=TruncDate('submitted_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        for item in submissions_by_day:
            item['date'] = item['date'].isoformat()

        # Problemas resueltos por dificultad
        solved_by_difficulty = list(
            Submission.objects.filter(user=user, verdict='AC')
            .values('problem__difficulty')
            .annotate(count=Count('problem', distinct=True))
            .order_by('problem__difficulty')
        )

        # Distribución por lenguaje
        language_distribution = list(
            Submission.objects.filter(user=user)
            .values('language')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Competencias participadas
        contests_participated = user.contest_participations.count()

        return Response({
            'overview': {
                'total_submissions': total_submissions,
                'ac_submissions': ac_submissions,
                'acceptance_rate': acceptance_rate,
                'unique_problems_solved': unique_solved,
                'contests_participated': contests_participated,
            },
            'charts': {
                'verdict_distribution': verdict_distribution,
                'submissions_by_day': submissions_by_day,
                'solved_by_difficulty': solved_by_difficulty,
                'language_distribution': language_distribution,
            },
        })
