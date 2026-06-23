"""
Vistas para el Asistente de Guía de Uso (IA Assistant).
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .ai_assistant import ask_openai_assistant


class AIAssistantView(APIView):
    """
    Endpoint para interactuar con el Agente de Guía de Uso basado en OpenAI API (gpt-5.4).
    Acepta peticiones POST con el mensaje del usuario.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response(
                {"error": "El campo 'message' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Consultar al asistente de IA
        reply = ask_openai_assistant(user_message)
        
        return Response(
            {"response": reply},
            status=status.HTTP_200_OK
        )

