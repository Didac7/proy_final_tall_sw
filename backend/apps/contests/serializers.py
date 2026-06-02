"""
Serializers de Competencias y Rankings.
"""

from rest_framework import serializers
from .models import Contest, ContestProblem, ContestParticipant, Ranking
from apps.problems.serializers import ProblemListSerializer


class ContestProblemSerializer(serializers.ModelSerializer):
    """Serializer para problemas dentro de una competencia."""
    problem_detail = ProblemListSerializer(source='problem', read_only=True)

    class Meta:
        model = ContestProblem
        fields = ['id', 'problem', 'problem_detail', 'label', 'order']
        read_only_fields = ['id']


class ContestListSerializer(serializers.ModelSerializer):
    """Serializer para listado de competencias."""
    created_by_name = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time',
            'status', 'status_display', 'created_by', 'created_by_name',
            'is_public', 'scoring_type', 'participant_count', 'is_registered', 'created_at'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'Desconocido'

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return False
        return obj.participants.filter(user=request.user).exists()


class ContestDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de competencia con problemas."""
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    problems = ContestProblemSerializer(source='contest_problems', many=True, read_only=True)
    participant_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time',
            'status', 'status_display', 'created_by', 'created_by_name',
            'is_public', 'scoring_type', 'penalty_time',
            'problems', 'participant_count', 'is_registered', 'created_at'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'Desconocido'

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.is_anonymous:
            return False
        return obj.participants.filter(user=request.user).exists()


class ContestCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/editar competencias."""

    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time',
            'is_public', 'scoring_type', 'penalty_time'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ContestParticipantSerializer(serializers.ModelSerializer):
    """Serializer para participantes."""
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ContestParticipant
        fields = ['id', 'user', 'username', 'full_name', 'team', 'registered_at']
        read_only_fields = ['id', 'registered_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class RankingSerializer(serializers.ModelSerializer):
    """Serializer para ranking de competencia."""
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()

    class Meta:
        model = Ranking
        fields = [
            'id', 'user', 'username', 'full_name', 'team', 'team_name',
            'solved_count', 'total_penalty', 'score', 'rank_position',
            'last_accepted_at'
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_team_name(self, obj):
        return obj.team.name if obj.team else None
