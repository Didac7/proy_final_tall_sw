/**
 * Detalle de entrenamiento — con PageHeader, Spinner, EmptyState, y barra de progreso premium.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconTarget, IconCheck } from '../../components/ui/Icons';

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTraining();
  }, [id]);

  const loadTraining = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        api.get(`/trainings/${id}/`),
        api.get(`/trainings/${id}/progress/`),
      ]);
      setTraining(tRes.data);
      setProgress(pRes.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Cargando detalles del entrenamiento..." />
      </div>
    );
  }

  if (!training) {
    return (
      <EmptyState
        icon={<IconTarget className="w-8 h-8 text-surface-550" />}
        title="Entrenamiento no encontrado"
        description="El plan de entrenamiento que estás buscando no existe o fue eliminado."
        action={
          <Link to="/trainings" className="btn-primary">
            Volver a Entrenamientos
          </Link>
        }
      />
    );
  }

  const solvedPercentage = progress?.percentage ?? 0;
  const solvedCount = progress?.solved ?? 0;
  const totalCount = progress?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Top navigation path */}
      <div className="flex items-center gap-2 text-xs text-surface-400 font-display">
        <Link to="/trainings" className="hover:text-primary-400 transition-colors">Entrenamientos</Link>
        <span>/</span>
        <span className="text-surface-200 font-medium">{training.title}</span>
      </div>

      {/* Header card */}
      <div className="card border-l-4 border-accent-500 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
        <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-100 tracking-tight mb-2">
          {training.title}
        </h1>
        <p className="text-surface-300 text-sm leading-relaxed max-w-3xl">
          {training.description || 'Sin descripción detallada disponible.'}
        </p>
      </div>

      {/* Progress Card */}
      {progress && (
        <div className="card space-y-4 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-surface-100 font-display">Tu Progreso de Aprendizaje</h2>
              <p className="text-xs text-surface-500 font-display mt-0.5">
                {solvedCount} de {totalCount} problemas completados
              </p>
            </div>
            <span className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              {solvedPercentage}%
            </span>
          </div>

          {/* Premium Progress Bar Wrapper */}
          <div className="relative">
            <div className="w-full h-3.5 bg-surface-900 rounded-full overflow-hidden border border-surface-850 p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${solvedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Problems Checklist Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
          <IconTarget className="w-5 h-5 text-primary-400" />
          <h3 className="text-sm font-bold text-surface-200 uppercase tracking-widest font-display">
            Lista de Ejercicios
          </h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16 text-center">#</th>
                <th>Problema</th>
                <th className="w-36 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {progress?.problems?.map((p: any) => (
                <tr key={p.problem_id} className={p.solved ? 'bg-emerald-500/[0.02]' : ''}>
                  <td className="text-center text-surface-500 font-mono text-xs font-semibold bg-surface-950/20">
                    {p.order + 1}
                  </td>
                  <td>
                    <Link
                      to={`/problems/${p.problem_id}`}
                      className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors"
                    >
                      {p.problem_title}
                    </Link>
                  </td>
                  <td className="text-center">
                    {p.solved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-display font-semibold">
                        <IconCheck className="w-3.5 h-3.5" />
                        Completado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-800 text-surface-400 border border-surface-700 text-xs font-display font-semibold">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!progress?.problems || progress.problems.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center text-surface-500 py-8">
                    No hay problemas asignados en este plan de entrenamiento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
