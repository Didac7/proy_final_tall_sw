"""
Serializers de Usuarios y Roles.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, Role, Permission


class RoleSerializer(serializers.ModelSerializer):
    """Serializer para CRUD de roles."""

    display_name = serializers.CharField(source='get_name_display', read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'name', 'display_name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer para permisos."""

    class Meta:
        model = Permission
        fields = ['id', 'codename', 'description']


class UserSerializer(serializers.ModelSerializer):
    """Serializer para lectura de usuarios."""

    role_name = serializers.CharField(read_only=True)
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_name', 'role_display', 'university', 'faculty',
            'bio', 'is_active', 'date_joined', 'created_at'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at']

    def get_role_display(self, obj):
        return obj.role.get_name_display() if obj.role else 'Sin rol'


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para creación de usuarios (admin)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'university', 'faculty', 'is_active'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualización de usuarios."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'role',
            'university', 'faculty', 'bio', 'is_active'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro público de usuarios."""

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'university', 'faculty'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden.'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        # Asignar rol de estudiante por defecto
        student_role = Role.objects.filter(name=Role.STUDENT).first()
        validated_data['role'] = student_role

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil del usuario autenticado."""

    role_name = serializers.CharField(read_only=True)
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_name', 'role_display', 'university', 'faculty',
            'bio', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'role', 'date_joined']

    def get_role_display(self, obj):
        return obj.role.get_name_display() if obj.role else 'Sin rol'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer JWT personalizado.
    Agrega datos del usuario al payload del token.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Claims personalizados
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role_name
        token['full_name'] = user.get_full_name()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Agregar datos del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role_name,
            'role_display': self.user.role.get_name_display() if self.user.role else 'Sin rol',
        }
        return data
