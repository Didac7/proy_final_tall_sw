"""
Serializers de Problemas y Casos de Prueba.
"""

from rest_framework import serializers
from .models import Problem, TestCase


class TestCaseSerializer(serializers.ModelSerializer):
    """Serializer para casos de prueba."""

    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_sample', 'order']
        read_only_fields = ['id']


class ProblemListSerializer(serializers.ModelSerializer):
    """Serializer para listado de problemas (sin test cases privados)."""

    author_name = serializers.SerializerMethodField()
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'difficulty', 'difficulty_display',
            'author', 'author_name', 'is_public', 'tags',
            'time_limit_ms', 'memory_limit_kb', 'created_at'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else 'Desconocido'


class ProblemDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de problema con test cases de ejemplo."""

    author_name = serializers.SerializerMethodField()
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    sample_test_cases = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'input_format', 'output_format',
            'sample_input', 'sample_output', 'difficulty', 'difficulty_display',
            'time_limit_ms', 'memory_limit_kb', 'author', 'author_name',
            'is_public', 'is_active', 'tags', 'sample_test_cases', 'created_at'
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else 'Desconocido'

    def get_sample_test_cases(self, obj):
        samples = obj.test_cases.filter(is_sample=True)
        return TestCaseSerializer(samples, many=True).data


class ProblemCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/editar problemas con test cases."""

    test_cases = TestCaseSerializer(many=True, required=False)

    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'input_format', 'output_format',
            'sample_input', 'sample_output', 'difficulty',
            'time_limit_ms', 'memory_limit_kb', 'is_public', 'tags',
            'test_cases'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        test_cases_data = validated_data.pop('test_cases', [])
        validated_data['author'] = self.context['request'].user
        problem = Problem.objects.create(**validated_data)

        for tc_data in test_cases_data:
            TestCase.objects.create(problem=problem, **tc_data)

        return problem

    def update(self, instance, validated_data):
        test_cases_data = validated_data.pop('test_cases', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si se envían test cases, reemplazar todos
        if test_cases_data is not None:
            instance.test_cases.all().delete()
            for tc_data in test_cases_data:
                TestCase.objects.create(problem=instance, **tc_data)

        return instance
