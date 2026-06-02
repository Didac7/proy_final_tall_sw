/**
 * Página de visualización de equipos — con PageHeader, Spinner, EmptyState, y cards premium.
 */
import { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconUsers } from '../../components/ui/Icons';

export default function TeamListPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data.results || res.data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    'from-teal-500 to-emerald-500',
    'from-indigo-500 to-purple-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-sky-500 to-blue-500',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipos"
        subtitle="Grupos oficiales de programación competitiva para representar a la UAGRM"
        icon={<IconUsers className="w-5 h-5 text-accent-400" />}
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" label="Cargando equipos..." />
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<IconUsers className="w-8 h-8 text-surface-550" />}
          title="No hay equipos registrados"
          description="Aún no se han registrado equipos para las competencias en la plataforma."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {teams.map((team, idx) => {
            const grad = gradients[idx % gradients.length];
            return (
              <div key={team.id} className="card-hover flex flex-col justify-between p-5 relative overflow-hidden group">
                {/* Visual subtle backdrop glow */}
                <div className={`absolute right-0 top-0 w-24 h-24 bg-gradient-to-br ${grad} opacity-[0.02] rounded-full blur-xl`} />

                <div>
                  {/* Team Card Header */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-bold font-display shadow-md shadow-black/10`}>
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-surface-100 font-display font-bold text-base tracking-tight leading-tight group-hover:text-primary-400 transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-surface-500 text-xs font-display mt-0.5">{team.member_count} miembros</p>
                    </div>
                  </div>

                  {/* Coach Section */}
                  {team.coach_name && (
                    <div className="mb-4 p-2.5 rounded-lg bg-surface-900/60 border border-surface-850/50 flex items-center gap-2 text-xs">
                      <span className="text-accent-400 text-sm">🎓</span>
                      <div>
                        <span className="text-surface-500 font-display">Coach: </span>
                        <span className="text-surface-200 font-semibold font-display">{team.coach_name}</span>
                      </div>
                    </div>
                  )}

                  {/* Members Section */}
                  {team.members && team.members.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[10px] text-surface-500 uppercase tracking-widest font-bold font-display">
                        Integrantes del Equipo
                      </p>
                      <div className="space-y-2">
                        {team.members.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-950/20 hover:bg-surface-950/40 border border-surface-850/20 transition-all">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500/60" />
                              <span className="text-surface-300 font-medium font-sans">
                                {m.full_name || m.username}
                              </span>
                            </div>
                            <span className="text-[10px] text-surface-500 font-mono bg-surface-900 px-1.5 py-0.5 rounded border border-surface-800">
                              {m.role_display}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
