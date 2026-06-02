"""
Vistas de Problemas y Banco de Problemas.
CU3 — Gestionar Problemas
CU4 — Gestionar Banco de Problemas
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Problem, TestCase
from .serializers import (
    ProblemListSerializer,
    ProblemDetailSerializer,
    ProblemCreateSerializer,
    TestCaseSerializer,
)
from apps.users.permissions import IsCoachOrAdmin


class ProblemViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de problemas.
    - Listado: todos los usuarios autenticados (solo públicos para estudiantes)
    - Crear/Editar/Eliminar: solo coach o admin
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['difficulty', 'is_public', 'is_active', 'author']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['title', 'difficulty', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_coach:
            return Problem.objects.all()
        return Problem.objects.filter(is_public=True, is_active=True)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProblemListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProblemCreateSerializer
        return ProblemDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsCoachOrAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get', 'post'])
    def testcases(self, request, pk=None):
        """Gestionar test cases de un problema."""
        problem = self.get_object()

        if request.method == 'GET':
            # Solo admin/coach ven todos los test cases
            if request.user.is_admin or request.user.is_coach:
                test_cases = problem.test_cases.all()
            else:
                test_cases = problem.test_cases.filter(is_sample=True)
            serializer = TestCaseSerializer(test_cases, many=True)
            return Response(serializer.data)

        # POST — agregar test case
        if not (request.user.is_admin or request.user.is_coach):
            return Response(
                {'error': 'No tiene permisos para esta acción.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = TestCaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(problem=problem)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
