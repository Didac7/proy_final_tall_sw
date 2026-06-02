/**
 * Detalle de problema con envío de solución usando Monaco Editor.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Problem, Language } from '../../types';
import CodeEditor from '../../components/ui/CodeEditor';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconCode, IconClock, IconSend, IconTrophy } from '../../components/ui/Icons';

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contestName, setContestName] = useState<string>('');

  const queryParams = new URLSearchParams(window.location.search);
  const contestId = queryParams.get('contest');

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      const res = await api.get(`/problems/${id}/`);
      setProblem(res.data);
      
      if (contestId) {
        try {
          const cRes = await api.get(`/contests/${contestId}/`);
          setContestName(cRes.data.title);
        } catch { /* empty */ }
      }
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const body: any = {
        problem: Number(id),
        language,
        source_code: code,
      };
      if (contestId) {
        body.contest = Number(contestId);
      }
      const res = await api.post('/submissions/', body);
      setResult(res.data);
    } catch (err: any) {
      setResult({
        verdict: 'ERROR',
        error_message: err.response?.data?.detail || 'Error al enviar la solución',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const verdictStyles: Record<string, string> = {
    AC: 'bg-verdict-ac/10 text-verdict-ac border-verdict-ac/30 shadow-verdict-ac/5',
    WA: 'bg-verdict-wa/10 text-verdict-wa border-verdict-wa/30 shadow-verdict-wa/5',
    TLE: 'bg-verdict-tle/10 text-verdict-tle border-verdict-tle/30 shadow-verdict-tle/5',
    RE: 'bg-verdict-re/10 text-verdict-re border-verdict-re/30 shadow-verdict-re/5',
    CE: 'bg-verdict-ce/10 text-verdict-ce border-verdict-ce/30 shadow-verdict-ce/5',
    ERROR: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/5',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Cargando detalles del problema..." />
      </div>
    );
  }

  if (!problem) {
    return (
      <EmptyState
        icon={<IconCode className="w-8 h-8 text-surface-400" />}
        title="Problema no encontrado"
        description="El problema que buscas no existe o ha sido eliminado."
        action={
          <Link to="/problems" className="btn-primary">
            Volver a la lista
          </Link>
        }
      />
    );
  }

  const difficultyBadge: Record<string, string> = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
  };

  return (
    <div className="space-y-6">
      {/* Top navigation path */}
      <div className="flex items-center gap-2 text-xs text-surface-400 font-display">
        {contestId ? (
          <>
            <Link to="/contests" className="hover:text-primary-400 transition-colors">Competencias</Link>
            <span>/</span>
            <Link to={`/contests/${contestId}`} className="hover:text-primary-400 transition-colors">
              {contestName || 'Detalle de Competencia'}
            </Link>
          </>
        ) : (
          <Link to="/problems" className="hover:text-primary-400 transition-colors">Problemas</Link>
        )}
        <span>/</span>
        <span className="text-surface-200 font-medium">{problem.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Problem Statement (7 cols on XL) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="card space-y-5">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-100 tracking-tight">
                  {problem.title}
                </h1>
                <span className={difficultyBadge[problem.difficulty] || 'badge-medium'}>
                  {problem.difficulty_display}
                </span>
              </div>
              <p className="text-xs text-surface-500 font-display">
                Publicado por <span className="text-surface-300 font-medium">{problem.author_name}</span>
              </p>
            </div>

            {/* Constraints Row */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-900/50 border border-surface-800 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                  <IconClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-surface-500 font-display">Límite de Tiempo</p>
                  <p className="font-mono text-surface-200 font-semibold">{problem.time_limit_ms} ms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-500/10 text-accent-400">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.5 7.75A.75.75 0 019.25 7h1.5a.75.75 0 010 1.5H10v1.25h.75a.75.75 0 010 1.5H10V13a.75.75 0 01-1.5 0v-1.75h-.75a.75.75 0 010-1.5H8.5V8.5h-.75a.75.75 0 010-1.5H8.5v-.75z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-surface-500 font-display">Límite de Memoria</p>
                  <p className="font-mono text-surface-200 font-semibold">{(problem.memory_limit_kb / 1024).toFixed(0)} MB</p>
                </div>
              </div>
            </div>

            {/* Markdown/Description blocks */}
            <div className="space-y-6">
              <div className="space-y-2 border-l-2 border-primary-500/40 pl-4">
                <h3 className="text-xs font-bold text-primary-400 uppercase tracking-widest font-display">Descripción</h3>
                <div className="text-surface-300 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {problem.description}
                </div>
              </div>

              {problem.input_format && (
                <div className="space-y-2 border-l-2 border-surface-700 pl-4">
                  <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest font-display">Formato de Entrada</h3>
                  <div className="text-surface-300 whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {problem.input_format}
                  </div>
                </div>
              )}

              {problem.output_format && (
                <div className="space-y-2 border-l-2 border-surface-700 pl-4">
                  <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest font-display">Formato de Salida</h3>
                  <div className="text-surface-300 whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {problem.output_format}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample I/O */}
          {(problem.sample_input || problem.sample_output) && (
            <div className="card space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
                <IconTrophy className="w-5 h-5 text-accent-400" />
                <h3 className="text-sm font-bold text-surface-200 uppercase tracking-widest font-display">
                  Casos de Ejemplo
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problem.sample_input && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-surface-500 font-display font-medium">Entrada de Ejemplo</p>
                    <pre className="bg-surface-950 rounded-xl p-4 text-xs font-mono text-emerald-400 border border-surface-850 overflow-x-auto select-all max-h-60">
                      {problem.sample_input}
                    </pre>
                  </div>
                )}
                {problem.sample_output && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-surface-500 font-display font-medium">Salida de Ejemplo</p>
                    <pre className="bg-surface-950 rounded-xl p-4 text-xs font-mono text-amber-400 border border-surface-850 overflow-x-auto select-all max-h-60">
                      {problem.sample_output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Submit & Result (5 cols on XL) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h2 className="text-lg font-bold text-surface-100 font-display">Enviar Solución</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="lang-select" className="sr-only">Seleccionar Lenguaje</label>
                <select
                  id="lang-select"
                  className="input py-1 px-3 w-auto text-xs font-display font-medium"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            {/* CodeEditor Component with Monaco */}
            <div className="shadow-lg shadow-black/10">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="450px"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !code.trim()}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="border-white" />
                  <span className="animate-pulse-soft">Evaluando en el Juez...</span>
                </>
              ) : (
                <>
                  <IconSend className="w-4 h-4" />
                  <span>Enviar Solución</span>
                </>
              )}
            </button>
          </div>

          {/* Verdict/Result Panel */}
          {result && (
            <div
              className={`card animate-slide-up border ${
                verdictStyles[result.verdict] || 'border-surface-700'
              } shadow-md overflow-hidden`}
            >
              <div className="flex items-center justify-between border-b border-surface-850/50 pb-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      result.verdict === 'AC' ? 'bg-verdict-ac animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <h3 className="font-bold text-lg font-display tracking-tight">
                    {result.verdict_display || result.verdict}
                  </h3>
                </div>
                {result.execution_time_ms > 0 && (
                  <span className="text-surface-400 text-xs font-mono bg-surface-900 px-2.5 py-1 rounded-md border border-surface-800">
                    {result.execution_time_ms} ms
                  </span>
                )}
              </div>

              {result.test_cases_passed !== undefined && (
                <div className="flex items-center justify-between text-sm text-surface-300">
                  <span>Pruebas superadas:</span>
                  <span className="font-mono font-bold">
                    {result.test_cases_passed} / {result.total_test_cases}
                  </span>
                </div>
              )}

              {/* Progress visual representation */}
              {result.total_test_cases > 0 && (
                <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden mt-2 border border-surface-850">
                  <div
                    className={`h-full ${result.verdict === 'AC' ? 'bg-verdict-ac' : 'bg-verdict-wa'}`}
                    style={{ width: `${(result.test_cases_passed / result.total_test_cases) * 100}%` }}
                  />
                </div>
              )}

              {result.error_message && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-red-400/80 font-display font-medium">Detalles del Error:</p>
                  <pre className="bg-surface-950 rounded-xl p-3 text-xs font-mono text-red-400 overflow-x-auto max-h-48 border border-red-900/30">
                    {result.error_message}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
