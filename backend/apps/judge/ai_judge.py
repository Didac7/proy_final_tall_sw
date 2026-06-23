"""
Motor de evaluación automática basado en Inteligencia Artificial (Google Gemini).
Analiza el código y retorna resultados estructurados (JSON).
"""

import json
import logging
import google.generativeai as genai
from google.generativeai import types
from django.conf import settings
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# 1. Definición del esquema JSON estricto para Gemini
class JudgeOutputSchema(BaseModel):
    verdict: str = Field(
        description="El veredicto técnico final para el código. Debe ser obligatoriamente uno de estos: 'AC' (Accepted), 'WA' (Wrong Answer), 'TLE' (Time Limit Exceeded), 'RE' (Runtime Error), o 'CE' (Compilation Error)"
    )
    execution_time_ms: int = Field(
        description="Tiempo de ejecución estimado que le tomaría al algoritmo en milisegundos para pasar los casos de prueba"
    )
    test_cases_passed: int = Field(
        description="Número de casos de prueba superados con éxito por la solución del estudiante"
    )
    error_message: str = Field(
        description="Si el veredicto no es AC, el error técnico específico (excepción, fallo del compilador o diferencia entre salida obtenida y esperada). Si es AC, puede estar vacío."
    )
    ai_feedback: str = Field(
        description="Explicación didáctica y constructiva en español de por qué falló el código (si el veredicto no es AC) y qué lógica o complejidad algorítmica debe mejorar el estudiante, sin entregarle el código de solución resuelto."
    )


class GeminiJudgeResult:
    """Clase envolvente del resultado para compatibilidad."""
    def __init__(self, verdict, execution_time_ms=0, memory_used_kb=0,
                 error_message='', ai_feedback='', test_cases_passed=0, total_test_cases=0):
        self.verdict = verdict
        self.execution_time_ms = execution_time_ms
        self.memory_used_kb = memory_used_kb
        self.error_message = error_message
        self.ai_feedback = ai_feedback
        self.test_cases_passed = test_cases_passed
        self.total_test_cases = total_test_cases


def evaluate_submission_with_ai(submission):
    """
    Evalúa una solución enviada por un estudiante usando la API de Gemini.
    """
    problem = submission.problem
    test_cases = problem.test_cases.all().order_by('order')
    total_test_cases = test_cases.count()

    # Si la clave API de Gemini no está configurada o contiene el placeholder de ejemplo
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key or api_key == 'YOUR_GEMINI_API_KEY_HERE':
        logger.error("La clave API de Gemini no está configurada en settings o contiene el valor por defecto.")
        return GeminiJudgeResult(
            verdict='RE',
            error_message="La clave API de Gemini ('GEMINI_API_KEY') no está configurada en el archivo .env del servidor.",
            ai_feedback="Por favor, solicita al administrador del sistema que configure una clave API de Google Gemini válida en las variables de entorno.",
            total_test_cases=total_test_cases,
            test_cases_passed=0
        )

    # Preparar el lote de casos de prueba
    test_cases_data = []
    for tc in test_cases:
        test_cases_data.append({
            "order": tc.order,
            "input_data": tc.input_data,
            "expected_output": tc.expected_output
        })

    try:
        # Configurar la API de Gemini
        genai.configure(api_key=api_key)
        
        # Usar el modelo gemini-2.5-flash por su velocidad y soporte para formatos estructurados
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Prompt con especificaciones y reglas estrictas de evaluación
        prompt = f"""
        Actúa como un Juez Automático ICPC oficial y Entrenador de Programación Competitiva.
        Tu trabajo es evaluar la corrección del código de programación enviado por un estudiante.

        DETALLES DEL PROBLEMA:
        - Título: {problem.title}
        - Dificultad: {problem.difficulty}
        - Límite de tiempo: {problem.time_limit_ms} ms
        - Límite de memoria: {problem.memory_limit_kb} KB
        
        ENUNCIADO DEL PROBLEMA:
        {problem.description}
        
        FORMATO DE ENTRADA:
        {problem.input_format}
        
        FORMATO DE SALIDA:
        {problem.output_format}

        CASOS DE PRUEBA OFICIALES:
        El código del alumno DEBE pasar cada uno de estos casos. Simula mentalmente la ejecución del código con las entradas provistas y compáralas rigurosamente con sus salidas esperadas:
        {json.dumps(test_cases_data, indent=2)}

        CÓDIGO FUENTE DEL ESTUDIANTE ({submission.language}):
        ```
        {submission.source_code}
        ```

        REGLAS DE EVALUACIÓN:
        1. Evalúa si el código compila o tiene errores de sintaxis en el lenguaje '{submission.language}'. Si falla sintácticamente, pon veredicto 'CE'.
        2. Ejecuta cada caso de prueba. Si el resultado es diferente de la salida esperada, pon veredicto 'WA'.
        3. Analiza la eficiencia del código. Si tiene un bucle infinito o un algoritmo ineficiente (ej: O(N^2) cuando N=10^6), pon veredicto 'TLE'.
        4. Si el programa genera desbordamiento de pila, error de índice fuera de rango, división por cero o excepciones en ejecución, pon veredicto 'RE'.
        5. Si y solo si pasa todos los casos de prueba de forma eficiente y correcta, pon veredicto 'AC'.
        6. Cuenta exactamente cuántos casos de prueba pasaron con éxito de forma estricta.
        7. Proporciona una retroalimentación didáctica y comprensible en español (en 'ai_feedback') explicando qué falló y dando consejos conceptuales (ej. complejidad temporal, casos borde), pero NUNCA incluyas la solución directa en código.
        """

        # Generar contenido forzando la salida estructurada
        response = model.generate_content(
            prompt,
            generation_config=types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=JudgeOutputSchema,
                temperature=0.1,  # Temperatura baja para mayor consistencia técnica
            ),
        )

        # Parsear el JSON retornado
        result_json = json.loads(response.text)
        
        # Validar y limpiar el veredicto
        verdict = result_json.get('verdict', 'RE')
        if verdict not in ['AC', 'WA', 'TLE', 'RE', 'CE']:
            verdict = 'RE'

        return GeminiJudgeResult(
            verdict=verdict,
            execution_time_ms=result_json.get('execution_time_ms', 0),
            memory_used_kb=0, # IA no puede medir memoria con precisión
            error_message=result_json.get('error_message', ''),
            ai_feedback=result_json.get('ai_feedback', ''),
            test_cases_passed=result_json.get('test_cases_passed', 0),
            total_test_cases=total_test_cases
        )

    except Exception as e:
        logger.exception("Error durante la evaluación con la API de Gemini")
        return GeminiJudgeResult(
            verdict='RE',
            error_message=f"Error en la llamada a la API de Gemini: {str(e)}",
            ai_feedback="Ocurrió un error inesperado al intentar evaluar la solución con la Inteligencia Artificial. Por favor intenta de nuevo.",
            total_test_cases=total_test_cases,
            test_cases_passed=0
        )
