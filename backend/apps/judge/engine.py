"""
Motor de evaluación automática (Judge).
Compila y ejecuta código usando subprocess.
Soporta: Python, Java.
"""

import os
import subprocess
import tempfile
import shutil
import time
from pathlib import Path
from django.conf import settings


# Configuración de lenguajes soportados
LANGUAGE_CONFIG = {
    'python': {
        'extension': '.py',
        'compile_cmd': None,  # Python no necesita compilación
        'run_cmd': lambda src, out_dir: ['python', str(src)],
        'needs_compilation': False,
    },
    'java': {
        'extension': '.java',
        'compile_cmd': lambda src, out_dir: ['javac', '-d', str(out_dir), str(src)],
        'run_cmd': lambda src, out_dir: ['java', '-cp', str(out_dir), 'Main'],
        'needs_compilation': True,
        'source_filename': 'Main.java',  # Java requiere que la clase se llame Main
    },
}


class JudgeResult:
    """Resultado de la evaluación de un envío."""

    def __init__(self, verdict, execution_time_ms=0, memory_used_kb=0,
                 error_message='', test_cases_passed=0, total_test_cases=0):
        self.verdict = verdict
        self.execution_time_ms = execution_time_ms
        self.memory_used_kb = memory_used_kb
        self.error_message = error_message
        self.test_cases_passed = test_cases_passed
        self.total_test_cases = total_test_cases


def evaluate_submission(submission):
    """
    Evalúa un envío completo:
    1. Guarda código en archivo temporal
    2. Compila (si es necesario)
    3. Ejecuta contra cada caso de prueba
    4. Compara resultados
    5. Retorna veredicto

    Returns:
        JudgeResult con el veredicto final
    """
    language = submission.language
    source_code = submission.source_code
    problem = submission.problem
    test_cases = problem.test_cases.all().order_by('order')
    time_limit_ms = problem.time_limit_ms

    if language not in LANGUAGE_CONFIG:
        return JudgeResult(
            verdict='CE',
            error_message=f'Lenguaje no soportado: {language}'
        )

    config = LANGUAGE_CONFIG[language]
    total_test_cases = test_cases.count()

    if total_test_cases == 0:
        return JudgeResult(
            verdict='AC',
            error_message='No hay casos de prueba definidos.',
            total_test_cases=0,
            test_cases_passed=0,
        )

    # Crear directorio temporal para la evaluación
    temp_dir = tempfile.mkdtemp(
        prefix='judge_',
        dir=str(settings.JUDGE_TEMP_DIR)
    )

    try:
        # 1. Guardar código fuente
        source_filename = config.get('source_filename', f'solution{config["extension"]}')
        source_path = Path(temp_dir) / source_filename
        source_path.write_text(source_code, encoding='utf-8')

        # 2. Compilar (si es necesario)
        if config['needs_compilation']:
            compile_result = _compile(source_path, temp_dir, config)
            if compile_result is not None:
                return JudgeResult(
                    verdict='CE',
                    error_message=compile_result,
                    total_test_cases=total_test_cases,
                )

        # 3. Ejecutar contra cada caso de prueba
        max_time = 0
        test_cases_passed = 0

        for tc in test_cases:
            result = _run_test_case(
                source_path, temp_dir, config,
                tc.input_data, tc.expected_output,
                time_limit_ms
            )

            if result.verdict != 'AC':
                result.test_cases_passed = test_cases_passed
                result.total_test_cases = total_test_cases
                return result

            max_time = max(max_time, result.execution_time_ms)
            test_cases_passed += 1

        # Todos los casos pasaron
        return JudgeResult(
            verdict='AC',
            execution_time_ms=max_time,
            test_cases_passed=test_cases_passed,
            total_test_cases=total_test_cases,
        )

    except Exception as e:
        return JudgeResult(
            verdict='RE',
            error_message=f'Error interno del juez: {str(e)}',
            total_test_cases=total_test_cases,
        )

    finally:
        # Limpiar archivos temporales
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


def _compile(source_path, temp_dir, config):
    """
    Compila el código fuente.
    Returns: None si exitoso, string con error si falla.
    """
    compile_cmd = config['compile_cmd'](source_path, temp_dir)

    try:
        result = subprocess.run(
            compile_cmd,
            capture_output=True,
            text=True,
            timeout=30,  # 30 segundos máximo para compilar
            cwd=temp_dir,
        )

        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or 'Error de compilación desconocido'
            return error_msg[:2000]  # Limitar longitud del error

        return None

    except subprocess.TimeoutExpired:
        return 'Tiempo de compilación excedido (30s).'
    except FileNotFoundError as e:
        return f'Compilador no encontrado: {str(e)}'
    except Exception as e:
        return f'Error de compilación: {str(e)}'


def _run_test_case(source_path, temp_dir, config, input_data, expected_output, time_limit_ms):
    """
    Ejecuta el programa con un caso de prueba y compara el resultado.
    Returns: JudgeResult
    """
    run_cmd = config['run_cmd'](source_path, temp_dir)
    time_limit_sec = time_limit_ms / 1000.0

    try:
        start_time = time.time()

        result = subprocess.run(
            run_cmd,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=time_limit_sec,
            cwd=temp_dir,
        )

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Runtime error
        if result.returncode != 0:
            error_msg = result.stderr or 'Error de ejecución'
            return JudgeResult(
                verdict='RE',
                execution_time_ms=elapsed_ms,
                error_message=error_msg[:2000],
            )

        # Comparar output
        actual_output = result.stdout.strip()
        expected = expected_output.strip()

        if actual_output == expected:
            return JudgeResult(
                verdict='AC',
                execution_time_ms=elapsed_ms,
            )
        else:
            return JudgeResult(
                verdict='WA',
                execution_time_ms=elapsed_ms,
                error_message=f'Esperado:\n{expected[:500]}\n\nObtenido:\n{actual_output[:500]}',
            )

    except subprocess.TimeoutExpired:
        return JudgeResult(
            verdict='TLE',
            execution_time_ms=time_limit_ms,
            error_message=f'Tiempo límite excedido ({time_limit_ms}ms).',
        )
    except Exception as e:
        return JudgeResult(
            verdict='RE',
            error_message=f'Error de ejecución: {str(e)}',
        )
