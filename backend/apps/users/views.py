"""
Vistas de Usuarios, Roles y Autenticación.
CU1 — Gestionar Roles
CU2 — Gestionar Usuarios
"""

from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User, Role
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ProfileSerializer,
    RoleSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsAdmin, IsOwnerOrAdmin, IsCoachOrAdmin


# ─── Autenticación ───────────────────────────────────────────────


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login: obtener par de tokens JWT con datos del usuario."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Registro público de nuevos usuarios."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar tokens para el nuevo usuario
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Usuario registrado exitosamente.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    """Logout: invalidar refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Sesión cerrada exitosamente.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Token inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ─── Perfil ──────────────────────────────────────────────────────


class ProfileView(generics.RetrieveUpdateAPIView):
    """Ver y editar perfil del usuario autenticado."""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── CRUD Usuarios (Admin) ──────────────────────────────────────


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de usuarios.
    Solo accesible por administradores.
    """
    queryset = User.objects.select_related('role').all()
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'created_at', 'date_joined']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), IsCoachOrAdmin()]
        return [IsAuthenticated(), IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        """Soft delete: desactivar usuario en lugar de eliminar."""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {'message': 'Usuario desactivado exitosamente.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Reactivar un usuario desactivado."""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(
            {'message': 'Usuario activado exitosamente.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Cambiar el rol de un usuario."""
        user = self.get_object()
        role_id = request.data.get('role_id')
        try:
            role = Role.objects.get(id=role_id)
            user.role = role
            user.save()
            return Response(
                {'message': f'Rol cambiado a {role.get_name_display()}.'},
                status=status.HTTP_200_OK
            )
        except Role.DoesNotExist:
            return Response(
                {'error': 'Rol no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )


# ─── CRUD Roles (Admin) ─────────────────────────────────────────


class RoleViewSet(viewsets.ModelViewSet):
    """
    CRUD completo de roles.
    Solo accesible por administradores.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'description']
