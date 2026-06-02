"""
Comando para crear datos de demostración.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, Role
from apps.problems.models import Problem, TestCase
from apps.contests.models import Contest, ContestProblem
from apps.teams.models import Team, TeamMember
from apps.trainings.models import Training, TrainingProblem


class Command(BaseCommand):
    help = 'Crear datos de demostracion para la plataforma'

    def handle(self, *args, **options):
        admin = User.objects.filter(username='admin').first()
        if not admin:
            self.stdout.write('Error: ejecuta setup_initial_data primero.')
            return

        # ── Problemas ─────────────────────────────────────
        self.stdout.write('Creando problemas...')

        p1, _ = Problem.objects.get_or_create(
            title='Suma de dos numeros',
            defaults={
                'description': 'Dados dos numeros enteros A y B, calcula su suma.',
                'input_format': 'Una linea con dos enteros A y B separados por espacio (1 <= A, B <= 10^9).',
                'output_format': 'Un solo entero: la suma A + B.',
                'sample_input': '3 5',
                'sample_output': '8',
                'difficulty': 'easy',
                'time_limit_ms': 1000,
                'memory_limit_kb': 262144,
                'author': admin,
                'is_public': True,
                'tags': 'matematica,basico',
            }
        )
        TestCase.objects.get_or_create(problem=p1, order=0, defaults={
            'input_data': '3 5', 'expected_output': '8', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p1, order=1, defaults={
            'input_data': '0 0', 'expected_output': '0', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p1, order=2, defaults={
            'input_data': '1000000000 1000000000', 'expected_output': '2000000000', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p1, order=3, defaults={
            'input_data': '-5 10', 'expected_output': '5', 'is_sample': False})

        p2, _ = Problem.objects.get_or_create(
            title='Numero par o impar',
            defaults={
                'description': 'Dado un numero entero N, determina si es par o impar.',
                'input_format': 'Un solo entero N (-10^9 <= N <= 10^9).',
                'output_format': 'Imprime "par" si N es par, o "impar" si N es impar.',
                'sample_input': '4',
                'sample_output': 'par',
                'difficulty': 'easy',
                'time_limit_ms': 1000,
                'memory_limit_kb': 262144,
                'author': admin,
                'is_public': True,
                'tags': 'matematica,condicional',
            }
        )
        TestCase.objects.get_or_create(problem=p2, order=0, defaults={
            'input_data': '4', 'expected_output': 'par', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p2, order=1, defaults={
            'input_data': '7', 'expected_output': 'impar', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p2, order=2, defaults={
            'input_data': '0', 'expected_output': 'par', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p2, order=3, defaults={
            'input_data': '-3', 'expected_output': 'impar', 'is_sample': False})

        p3, _ = Problem.objects.get_or_create(
            title='Fibonacci N-esimo',
            defaults={
                'description': 'Dado un entero N, calcula el N-esimo termino de la secuencia de Fibonacci.\n\nLa secuencia de Fibonacci se define como:\nF(0) = 0\nF(1) = 1\nF(n) = F(n-1) + F(n-2) para n >= 2',
                'input_format': 'Un solo entero N (0 <= N <= 40).',
                'output_format': 'Un solo entero: el N-esimo numero de Fibonacci.',
                'sample_input': '6',
                'sample_output': '8',
                'difficulty': 'medium',
                'time_limit_ms': 2000,
                'memory_limit_kb': 262144,
                'author': admin,
                'is_public': True,
                'tags': 'dinamica,recursion,matematica',
            }
        )
        TestCase.objects.get_or_create(problem=p3, order=0, defaults={
            'input_data': '6', 'expected_output': '8', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p3, order=1, defaults={
            'input_data': '0', 'expected_output': '0', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p3, order=2, defaults={
            'input_data': '10', 'expected_output': '55', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p3, order=3, defaults={
            'input_data': '20', 'expected_output': '6765', 'is_sample': False})

        p4, _ = Problem.objects.get_or_create(
            title='Maximo Comun Divisor',
            defaults={
                'description': 'Dados dos enteros positivos A y B, calcula su Maximo Comun Divisor (MCD) usando el algoritmo de Euclides.',
                'input_format': 'Una linea con dos enteros positivos A y B (1 <= A, B <= 10^9).',
                'output_format': 'Un solo entero: el MCD de A y B.',
                'sample_input': '12 8',
                'sample_output': '4',
                'difficulty': 'medium',
                'time_limit_ms': 1000,
                'memory_limit_kb': 262144,
                'author': admin,
                'is_public': True,
                'tags': 'matematica,euclides,numero-teoria',
            }
        )
        TestCase.objects.get_or_create(problem=p4, order=0, defaults={
            'input_data': '12 8', 'expected_output': '4', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p4, order=1, defaults={
            'input_data': '100 25', 'expected_output': '25', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p4, order=2, defaults={
            'input_data': '7 13', 'expected_output': '1', 'is_sample': False})

        p5, _ = Problem.objects.get_or_create(
            title='Ordenar arreglo',
            defaults={
                'description': 'Dado un arreglo de N enteros, ordenalos de menor a mayor e imprimalos separados por espacio.',
                'input_format': 'La primera linea contiene un entero N (1 <= N <= 1000).\nLa segunda linea contiene N enteros separados por espacio.',
                'output_format': 'Una linea con los N enteros ordenados de menor a mayor, separados por espacio.',
                'sample_input': '5\n3 1 4 1 5',
                'sample_output': '1 1 3 4 5',
                'difficulty': 'hard',
                'time_limit_ms': 2000,
                'memory_limit_kb': 262144,
                'author': admin,
                'is_public': True,
                'tags': 'ordenamiento,arreglos',
            }
        )
        TestCase.objects.get_or_create(problem=p5, order=0, defaults={
            'input_data': '5\n3 1 4 1 5', 'expected_output': '1 1 3 4 5', 'is_sample': True})
        TestCase.objects.get_or_create(problem=p5, order=1, defaults={
            'input_data': '1\n42', 'expected_output': '42', 'is_sample': False})
        TestCase.objects.get_or_create(problem=p5, order=2, defaults={
            'input_data': '3\n-1 0 1', 'expected_output': '-1 0 1', 'is_sample': False})

        # ── Competencia ───────────────────────────────────
        self.stdout.write('Creando competencia de ejemplo...')

        now = timezone.now()
        contest, _ = Contest.objects.get_or_create(
            title='ICPC UAGRM - Clasificatoria 2026',
            defaults={
                'description': 'Competencia clasificatoria para seleccionar equipos que representaran a la UAGRM en la ICPC Regional.',
                'start_time': now - timedelta(hours=1),
                'end_time': now + timedelta(hours=4),
                'status': 'active',
                'created_by': admin,
                'is_public': True,
                'scoring_type': 'icpc',
                'penalty_time': 20,
            }
        )

        for i, (problem, label) in enumerate([(p1, 'A'), (p2, 'B'), (p3, 'C'), (p4, 'D'), (p5, 'E')]):
            ContestProblem.objects.get_or_create(
                contest=contest, problem=problem,
                defaults={'label': label, 'order': i}
            )

        # ── Equipo ────────────────────────────────────────
        self.stdout.write('Creando equipo de ejemplo...')

        team, _ = Team.objects.get_or_create(
            name='ByteBusters UAGRM',
            defaults={
                'coach': admin,
                'description': 'Equipo oficial de programacion competitiva de la UAGRM.',
            }
        )

        # ── Entrenamiento ─────────────────────────────────
        self.stdout.write('Creando entrenamiento de ejemplo...')

        training, _ = Training.objects.get_or_create(
            title='Entrenamiento Basico - Semana 1',
            defaults={
                'description': 'Problemas basicos para calentar motores. Cubre: I/O, condicionales, bucles y matematica basica.',
                'created_by': admin,
                'start_date': now,
                'end_date': now + timedelta(days=7),
                'status': 'active',
                'is_public': True,
            }
        )

        for i, problem in enumerate([p1, p2, p3]):
            TrainingProblem.objects.get_or_create(
                training=training, problem=problem,
                defaults={'order': i}
            )

        self.stdout.write(self.style.SUCCESS(
            'Datos de demostracion creados exitosamente.'
        ))
