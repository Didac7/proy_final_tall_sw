"""Serializers de Entrenamientos."""
from rest_framework import serializers
from .models import Training, TrainingProblem
from apps.problems.serializers import ProblemListSerializer


class TrainingProblemSerializer(serializers.ModelSerializer):
    problem_detail = ProblemListSerializer(source='problem', read_only=True)

    class Meta:
        model = TrainingProblem
        fields = ['id', 'problem', 'problem_detail', 'order']
        read_only_fields = ['id']


class TrainingListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    problem_count = serializers.SerializerMethodField()

    class Meta:
        model = Training
        fields = [
            'id', 'title', 'description', 'created_by', 'created_by_name',
            'start_date', 'end_date', 'status', 'status_display',
            'is_public', 'problem_count', 'created_at'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'Desconocido'

    def get_problem_count(self, obj):
        return obj.training_problems.count()


class TrainingDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    problems = TrainingProblemSerializer(source='training_problems', many=True, read_only=True)

    class Meta:
        model = Training
        fields = [
            'id', 'title', 'description', 'created_by', 'created_by_name',
            'start_date', 'end_date', 'status', 'status_display',
            'is_public', 'problems', 'created_at'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'Desconocido'


class TrainingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'status', 'is_public']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
