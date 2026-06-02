/**
 * Detalle de competencia con tabs (Información, Problemas, Ranking) y actualización periódica.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconTrophy, IconCode, IconUsers } from '../../components/ui/Icons';

export default function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [contest, setContest] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [tab, setTab] = useState<'info' | 'problems' | 'ranking'>('info');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadContest();
  }, [id]);

  // Polling para ranking cada 30s
  useEffect(() => {
    if (tab !== 'ranking') return;
    const interval = setInterval(loadRanking, 30000);
    return () => clearInterval(interval);
  }, [tab, id]);

  const loadContest = async () => {
    try {
      const res = await api.get(`/contests/${id}/`);
      setContest(res.data);
      loadRanking();
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const loadRanking = useCallback(async () => {
    try {
      const res = await api.get(`/contests/${id}/ranking/`);
      setRanking(res.data);
    } catch {
      /* empty */
    }
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register/`);
      loadContest();
    } catch {
      /* empty */
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Cargando competencia..." />
      </div>
    );
  }

  if (!contest) {
    return (
      <EmptyState
        icon={<IconTrophy className="w-8 h-8 text-surface-550" />}
        title="Competencia no encontrada"
        description="La competencia que estás buscando no existe o fue eliminada."
        action={
          <Link to="/contests" className="btn-primary">
            Volver a Competencias
          </Link>
        }
      />
    );
  }

  const tabs = [
    {
      id: 'info',
      label: 'Información',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    { id: 'problems', label: 'Problemas', icon: <IconCode className="w-4 h-4" /> },
    { id: 'ranking', label: 'Ranking / Scoreboard', icon: <IconTrophy className="w-4 h-4" /> },
  ] as const;

  const isUserRegistered = contest.is_registered;

  return (
    <div className="space-y-6">
      {/* Contest Header Card */}
      <div className="card border-l-4 border-primary-500 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-100 tracking-tight">
                {contest.title}
              </h1>
              <span
                className={`badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  contest.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-soft'
                    : contest.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-surface-800 text-surface-400 border border-surface-700'
                }`}
              >
                {contest.status_display}
              </span>
            </div>
            <p className="text-surface-300 text-sm leading-relaxed max-w-3xl">
              {contest.description || 'Sin descripción detallada.'}
            </p>
          </div>

          <div className="shrink-0">
            {isUserRegistered ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-display font-bold">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Registrado
              </span>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering || contest.status === 'finished'}
                className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/15"
              >
                {registering ? (
                  <>
                    <Spinner size="sm" className="border-white" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <IconUsers className="w-4 h-4" />
                    <span>Registrarse en Competencia</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-4 border-t border-surface-800/80 text-xs text-surface-400 font-display">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            <span>
              {new Date(contest.start_time).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })} —{' '}
              {new Date(contest.end_time).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconUsers className="w-4 h-4 text-surface-500" />
            <span>{contest.participant_count} participantes</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="uppercase tracking-wider font-semibold text-primary-400">Reglas: {contest.scoring_type}</span>
          </div>
        </div>
      </div>

      {/* Elegant Tab System */}
      <div className="flex p-1 bg-surface-900/60 border border-surface-850/80 rounded-xl max-w-md">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-display font-semibold transition-all ${
              tab === t.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === 'info' && (
        <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="space-y-1">
            <p className="text-xs text-surface-500 font-display font-medium">Estado de Competencia</p>
            <p className="text-surface-200 font-semibold text-sm">{contest.status_display}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-surface-500 font-display font-medium">Formato de Penalización</p>
            <p className="text-surface-200 font-semibold text-sm">{contest.penalty_time} minutos por fallo</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-surface-500 font-display font-medium">Tipo de Puntuación</p>
            <p className="text-surface-200 font-semibold text-sm uppercase tracking-wider font-mono">
              {contest.scoring_type.toUpperCase()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-surface-500 font-display font-medium">Organizador</p>
            <p className="text-surface-200 font-semibold text-sm">{contest.created_by_name || 'Profesor de FICCT'}</p>
          </div>
        </div>
      )}

      {tab === 'problems' && (
        <div className="animate-fade-in space-y-4">
          {!isUserRegistered && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-display flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Debes registrarte en la competencia para poder ver los problemas completos y enviar tus soluciones.</span>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16 text-center">Letra</th>
                  <th>Problema</th>
                  <th className="w-28">Dificultad</th>
                  <th className="w-32 hidden md:table-cell">Límites</th>
                </tr>
              </thead>
              <tbody>
                {contest.problems?.map((cp: any) => (
                  <tr key={cp.id}>
                    <td className="font-bold text-center text-primary-400 font-mono text-base bg-surface-950/20">
                      {cp.label}
                    </td>
                    <td>
                      {isUserRegistered ? (
                        <Link
                          to={`/problems/${cp.problem}?contest=${id}`}
                          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors text-sm"
                        >
                          {cp.problem_detail?.title || `Problema ${cp.label}`}
                        </Link>
                      ) : (
                        <span className="text-surface-400 font-medium text-sm">
                          {cp.problem_detail?.title || `Problema ${cp.label}`}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-${cp.problem_detail?.difficulty || 'medium'}`}>
                        {cp.problem_detail?.difficulty_display || 'Medio'}
                      </span>
                    </td>
                    <td className="text-surface-400 text-xs font-mono hidden md:table-cell">
                      {cp.problem_detail?.time_limit_ms}ms /{' '}
                      {((cp.problem_detail?.memory_limit_kb || 0) / 1024).toFixed(0)}MB
                    </td>
                  </tr>
                ))}
                {(!contest.problems || contest.problems.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center text-surface-500 py-8">
                      No hay problemas asignados en esta competencia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ranking' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between text-xs text-surface-500 font-display">
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Actualización automática cada 30 segundos
            </p>
            <button
              onClick={loadRanking}
              className="px-3 py-1 bg-surface-850 hover:bg-surface-800 border border-surface-750 text-surface-300 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              Actualizar
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16 text-center">Puesto</th>
                  <th>Competidor</th>
                  <th>Equipo</th>
                  <th className="w-24 text-center">Resueltos</th>
                  <th className="w-28 text-right">Penalización</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r: any, idx: number) => {
                  const isCurrentUser = r.username === user?.username;
                  const rankPos = r.rank_position || idx + 1;
                  return (
                    <tr
                      key={r.id || r.username}
                      className={
                        isCurrentUser
                          ? 'bg-primary-500/10 hover:bg-primary-500/15 border-l-2 border-primary-500'
                          : ''
                      }
                    >
                      <td className="text-center font-display font-extrabold text-base bg-surface-950/20 text-surface-200">
                        {rankPos === 1 ? '🥇' : rankPos === 2 ? '🥈' : rankPos === 3 ? '🥉' : rankPos}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-surface-100">{r.full_name || r.username}</span>
                          <span className="text-xs text-surface-500 font-mono">@{r.username}</span>
                        </div>
                      </td>
                      <td className="text-surface-400 text-sm">{r.team_name || 'Individual'}</td>
                      <td className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm">
                          {r.solved_count}
                        </span>
                      </td>
                      <td className="text-right text-surface-300 font-mono text-xs font-medium">
                        {r.total_penalty} min
                      </td>
                    </tr>
                  );
                })}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-surface-500 py-8">
                      Sin datos de ranking en este momento. Los envíos de soluciones generarán el scoreboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
