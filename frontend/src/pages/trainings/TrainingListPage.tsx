/**
 * Página de entrenamientos — con PageHeader, Spinner, EmptyState, y tarjetas con hover premium.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconTarget } from '../../components/ui/Icons';

export default function TrainingListPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const res = await api.get('/trainings/');
      setTrainings(res.data.results || res.data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrenamientos"
        subtitle="Planes de estudio y sets de problemas organizados por temas y dificultad"
        icon={<IconTarget className="w-5 h-5 text-accent-400" />}
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" label="Cargando entrenamientos..." />
        </div>
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={<IconTarget className="w-8 h-8 text-surface-550" />}
          title="No hay entrenamientos disponibles"
          description="Actualmente no hay planes de entrenamiento publicados. Vuelve a consultar más tarde."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {trainings.map((t) => (
            <Link
              key={t.id}
              to={`/trainings/${t.id}`}
              className="card-hover flex flex-col justify-between p-5 group relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-display font-bold text-surface-100 group-hover:text-primary-400 transition-colors tracking-tight line-clamp-1">
                    {t.title}
                  </h3>
                  <span
                    className={`badge text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      t.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-surface-800 text-surface-400 border border-surface-700'
                    }`}
                  >
                    {t.status_display}
                  </span>
                </div>
                <p className="text-surface-400 text-sm line-clamp-2 mb-6 font-sans">
                  {t.description || 'Sin descripción detallada disponible.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-surface-500 font-display border-t border-surface-800/60 pt-4 mt-auto">
                <span className="flex items-center gap-1.5 font-semibold text-primary-400 bg-primary-500/5 px-2.5 py-1 rounded-lg border border-primary-500/10">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {t.problem_count} problemas
                </span>
                <span className="text-surface-500 hover:text-surface-300 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Comenzar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
