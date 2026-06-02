"""Serializers de Equipos."""
from rest_framework import serializers
from .models import Team, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'username', 'full_name', 'role', 'role_display', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class TeamSerializer(serializers.ModelSerializer):
    coach_name = serializers.SerializerMethodField()
    members = TeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'coach', 'coach_name',
            'is_active', 'members', 'member_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_coach_name(self, obj):
        return obj.coach.get_full_name() if obj.coach else None


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'coach']
        read_only_fields = ['id']
