"""Vistas de Equipos. CU9 — Gestionar Equipos"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamCreateSerializer, TeamMemberSerializer
from apps.users.permissions import IsCoachOrAdmin, IsOwnerOrAdmin


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.prefetch_related('members__user').all()
    filter_backends = []
    ordering = ['name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TeamCreateSerializer
        return TeamSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'add_member', 'remove_member']:
            return [IsAuthenticated(), IsCoachOrAdmin(), IsOwnerOrAdmin()]
        if self.action == 'create':
            return [IsAuthenticated(), IsCoachOrAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        if not user_id:
            return Response({'error': 'user_id requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        member, created = TeamMember.objects.get_or_create(
            team=team, user_id=user_id, defaults={'role': role}
        )
        if not created:
            return Response({'message': 'El usuario ya es miembro.'}, status=status.HTTP_200_OK)
        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove_member/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        team = self.get_object()
        try:
            member = TeamMember.objects.get(team=team, user_id=user_id)
            member.delete()
            return Response({'message': 'Miembro removido.'}, status=status.HTTP_200_OK)
        except TeamMember.DoesNotExist:
            return Response({'error': 'Miembro no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
