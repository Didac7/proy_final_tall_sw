/**
 * Página de listado de competencias — con PageHeader, Spinner, EmptyState, SVG icons.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconTrophy } from '../../components/ui/Icons';

export default function ContestListPage() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadContests();
  }, [filter]);

  const loadContests = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) params.status = filter;
      const res = await api.get('/contests/', { params });
      setContests(res.data.results || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const statusBadge: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-soft',
    finished: 'bg-surface-800 text-surface-400 border border-surface-700',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    active: 'En curso',
    finished: 'Finalizada',
    cancelled: 'Cancelada',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competencias"
        subtitle="Competencias oficiales y entrenamientos cronometrados tipo ICPC"
        icon={<IconTrophy className="w-5 h-5 text-accent-400" />}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface-900/60 border border-surface-800/80 rounded-xl w-fit">
        {[
          { key: '', label: 'Todas' },
          { key: 'active', label: 'En curso' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'finished', label: 'Finalizadas' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all ${
              filter === s.key
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-850/50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" label="Cargando competencias..." />
        </div>
      ) : contests.length === 0 ? (
        <EmptyState
          icon={<IconTrophy className="w-8 h-8 text-surface-500" />}
          title="No hay competencias"
          description={
            filter
              ? `No se encontraron competencias en estado "${statusLabel[filter]}".`
              : 'No hay ninguna competencia registrada en la plataforma en este momento.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contests.map((c) => (
            <Link key={c.id} to={`/contests/${c.id}`} className="card-hover flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-display font-bold text-surface-100 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {c.title}
                  </h3>
                  <span className={`badge text-[10px] uppercase tracking-wider font-semibold font-display px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}>
                    {statusLabel[c.status]}
                  </span>
                </div>
                <p className="text-surface-400 text-sm line-clamp-2 mb-6 font-sans">
                  {c.description || 'Sin descripción detallada.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-surface-500 font-display border-t border-surface-800/60 pt-4 mt-auto">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                  </svg>
                  {new Date(c.start_time).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {c.participant_count} participantes
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
