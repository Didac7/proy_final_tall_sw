"""
Serializers de Envíos.
"""

from rest_framework import serializers
from .models import Submission


class SubmissionListSerializer(serializers.ModelSerializer):
    """Serializer para listado de envíos."""
    username = serializers.CharField(source='user.username', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    contest_title = serializers.SerializerMethodField()
    verdict_display = serializers.CharField(source='get_verdict_display', read_only=True)
    language_display = serializers.CharField(source='get_language_display', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'user', 'username', 'problem', 'problem_title',
            'contest', 'contest_title', 'language', 'language_display',
            'verdict', 'verdict_display', 'execution_time_ms',
            'test_cases_passed', 'total_test_cases', 'submitted_at'
        ]

    def get_contest_title(self, obj):
        return obj.contest.title if obj.contest else None


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de envío (incluye código fuente)."""
    username = serializers.CharField(source='user.username', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    verdict_display = serializers.CharField(source='get_verdict_display', read_only=True)
    language_display = serializers.CharField(source='get_language_display', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'user', 'username', 'problem', 'problem_title',
            'contest', 'language', 'language_display', 'source_code',
            'verdict', 'verdict_display', 'execution_time_ms',
            'memory_used_kb', 'error_message', 'ai_feedback',
            'test_cases_passed', 'total_test_cases', 'submitted_at'
        ]


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear envíos."""

    class Meta:
        model = Submission
        fields = ['problem', 'contest', 'language', 'source_code']

    def validate_language(self, value):
        allowed = ['python', 'java']
        if value not in allowed:
            raise serializers.ValidationError(
                f'Lenguaje no soportado. Opciones: {", ".join(allowed)}'
            )
        return value

    def validate(self, attrs):
        contest = attrs.get('contest')
        if contest:
            user = self.context['request'].user
            if not (user.is_admin or user.is_coach):
                if contest.mode == 'team':
                    from apps.teams.models import TeamMember
                    from apps.contests.models import Ranking
                    membership = TeamMember.objects.filter(user=user, team__is_active=True).first()
                    if not membership:
                        raise serializers.ValidationError(
                            'Para enviar soluciones a esta competencia por equipos, debes pertenecer a un equipo activo.'
                        )
                    if not Ranking.objects.filter(contest=contest, team=membership.team).exists():
                        raise serializers.ValidationError(
                            f'Tu equipo "{membership.team.name}" no está registrado en esta competencia.'
                        )
                else:
                    from apps.contests.models import ContestParticipant
                    if not ContestParticipant.objects.filter(contest=contest, user=user).exists():
                        raise serializers.ValidationError(
                            'Debes estar registrado en esta competencia para poder enviar soluciones.'
                        )
        return attrs
