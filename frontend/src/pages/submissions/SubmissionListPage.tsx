/**
 * Página de listado de envíos — con PageHeader, Spinner, EmptyState, y veredictos estilizados.
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconSend } from '../../components/ui/Icons';

export default function SubmissionListPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [verdictFilter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (verdictFilter) params.verdict = verdictFilter;
      const res = await api.get('/submissions/', { params });
      setSubmissions(res.data.results || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const verdictBadge: Record<string, string> = {
    AC: 'bg-verdict-ac/10 text-verdict-ac border border-verdict-ac/25 font-bold',
    WA: 'bg-verdict-wa/10 text-verdict-wa border border-verdict-wa/25 font-bold',
    TLE: 'bg-verdict-tle/10 text-verdict-tle border border-verdict-tle/25 font-bold',
    RE: 'bg-verdict-re/10 text-verdict-re border border-verdict-re/25 font-bold',
    CE: 'bg-verdict-ce/10 text-verdict-ce border border-verdict-ce/25 font-bold',
    pending: 'bg-verdict-pending/10 text-verdict-pending border border-verdict-pending/25 animate-pulse',
  };

  const verdicts = ['', 'AC', 'WA', 'TLE', 'RE', 'CE'];
  const verdictLabels: Record<string, string> = {
    '': 'Todos',
    AC: 'AC (Correcto)',
    WA: 'WA (Incorrecto)',
    TLE: 'TLE (Tiempo Límite)',
    RE: 'RE (Error Ejecución)',
    CE: 'CE (Error Compilación)',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Envíos"
        subtitle="Historial de soluciones enviadas al juez en línea"
        icon={<IconSend className="w-5 h-5 text-accent-400" />}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface-900/60 border border-surface-800/80 rounded-xl w-fit">
        {verdicts.map((v) => (
          <button
            key={v}
            onClick={() => setVerdictFilter(v)}
            className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all ${
              verdictFilter === v
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-850/50'
            }`}
          >
            {v === '' ? 'Todos' : v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" label="Cargando envíos..." />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<IconSend className="w-8 h-8 text-surface-550" />}
          title="No hay envíos registrados"
          description={
            verdictFilter
              ? `No tienes envíos con el veredicto ${verdictLabels[verdictFilter]}.`
              : 'Todavía no has enviado ninguna solución. Elige un problema y envía tu código para empezar.'
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">ID</th>
                <th>Problema</th>
                <th className="w-28">Lenguaje</th>
                <th className="w-36 text-center">Veredicto</th>
                <th className="w-24 text-right">Tiempo</th>
                <th className="w-28 text-center">Pruebas</th>
                <th className="w-48 text-right hidden md:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="text-surface-500 font-mono text-xs font-semibold">#{s.id}</td>
                  <td>
                    <span className="text-surface-100 font-semibold text-sm block">
                      {s.problem_title}
                    </span>
                  </td>
                  <td className="text-surface-300 font-display text-xs font-medium">{s.language_display}</td>
                  <td className="text-center">
                    <span
                      className={`inline-block w-full py-1 text-center text-xs font-mono rounded-md ${
                        verdictBadge[s.verdict] || 'bg-surface-800 text-surface-400'
                      }`}
                    >
                      {s.verdict}
                    </span>
                  </td>
                  <td className="text-right text-surface-200 font-mono text-xs font-semibold">
                    {s.execution_time_ms} ms
                  </td>
                  <td className="text-center text-surface-300 font-mono text-xs">
                    {s.test_cases_passed} / {s.total_test_cases}
                  </td>
                  <td className="text-right text-surface-500 text-xs font-display hidden md:table-cell">
                    {new Date(s.submitted_at).toLocaleString('es-BO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
