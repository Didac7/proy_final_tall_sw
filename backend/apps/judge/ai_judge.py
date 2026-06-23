"""
Motor de evaluación automática basado en Inteligencia Artificial (OpenAI ChatGPT).
Analiza el código y retorna resultados estructurados (JSON).
"""

import json
import logging
from openai import OpenAI
from django.conf import settings
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# 1. Definición del esquema JSON estricto para OpenAI
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


class AIJudgeResult:
    """Clase envolvente del resultado para compatibilidad de vistas."""
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
    Evalúa una solución enviada por un estudiante usando la API de OpenAI con el modelo gpt-5.4.
    """
    problem = submission.problem
    test_cases = problem.test_cases.all().order_by('order')
    total_test_cases = test_cases.count()

    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    if not api_key:
        logger.error("La clave API de OpenAI no está configurada en settings.")
        return AIJudgeResult(
            verdict='RE',
            error_message="La clave API de OpenAI ('OPENAI_API_KEY') no está configurada en el archivo .env del servidor.",
            ai_feedback="Por favor, configura una clave API de OpenAI válida en las variables de entorno.",
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
        # Inicializar el cliente de OpenAI
        client = OpenAI(api_key=api_key)

        # Prompt con especificaciones y reglas de evaluación
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

        # Generar contenido forzando la salida estructurada con el modelo gpt-5.4
        response = client.beta.chat.completions.parse(
            model="gpt-5.4",
            messages=[
                {"role": "system", "content": "Eres un juez automático ICPC de alta precisión que responde en formato JSON estructurado."},
                {"role": "user", "content": prompt}
            ],
            response_format=JudgeOutputSchema,
            temperature=0.1
        )

        # Obtener el resultado parseado directamente
        result_obj = response.choices[0].message.parsed
        
        # Validar veredicto
        verdict = result_obj.verdict
        if verdict not in ['AC', 'WA', 'TLE', 'RE', 'CE']:
            verdict = 'RE'

        return AIJudgeResult(
            verdict=verdict,
            execution_time_ms=result_obj.execution_time_ms,
            memory_used_kb=0,
            error_message=result_obj.error_message,
            ai_feedback=result_obj.ai_feedback,
            test_cases_passed=result_obj.test_cases_passed,
            total_test_cases=total_test_cases
        )

    except Exception as e:
        logger.exception("Error durante la evaluación con la API de OpenAI (gpt-5.4)")
        return AIJudgeResult(
            verdict='RE',
            error_message=f"Error en la llamada a la API de OpenAI: {str(e)}",
            ai_feedback="Ocurrió un error inesperado al intentar evaluar la solución con la Inteligencia Artificial. Por favor intenta de nuevo.",
            total_test_cases=total_test_cases,
            test_cases_passed=0
        )
