/**
 * Dashboard principal — con PageHeader, stats cards mejorados, y componentes compartidos.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconDashboard, IconCode, IconTrophy, IconSend, IconUsers, IconClock } from '../../components/ui/Icons';

interface DashboardStats {
  problems: number;
  contests: number;
  submissions: number;
  teams: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ problems: 0, contests: 0, submissions: 0, teams: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [activeContests, setActiveContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [problemsRes, contestsRes, submissionsRes, teamsRes] = await Promise.all([
        api.get('/problems/?page_size=1').catch(() => ({ data: { count: 0 } })),
        api.get('/contests/?page_size=1').catch(() => ({ data: { count: 0 } })),
        api.get('/submissions/?page_size=5').catch(() => ({ data: { count: 0, results: [] } })),
        api.get('/teams/?page_size=1').catch(() => ({ data: { count: 0 } })),
      ]);

      setStats({
        problems: problemsRes.data.count || 0,
        contests: contestsRes.data.count || 0,
        submissions: submissionsRes.data.count || 0,
        teams: teamsRes.data.count || 0,
      });

      setRecentSubmissions(submissionsRes.data.results || []);

      const activeRes = await api.get('/contests/?status=active&page_size=5').catch(() => ({ data: { results: [] } }));
      setActiveContests(activeRes.data.results || []);
    } catch {
      // Silenciar errores en dashboard
    } finally {
      setLoading(false);
    }
  };

  const verdictColor: Record<string, string> = {
    AC: 'text-verdict-ac', WA: 'text-verdict-wa', TLE: 'text-verdict-tle',
    RE: 'text-verdict-re', CE: 'text-verdict-ce', pending: 'text-verdict-pending',
  };

  const statCards = [
    { label: 'Problemas', value: stats.problems, icon: IconCode, gradient: 'from-primary-600/20 to-primary-500/5', accent: 'text-primary-400', link: '/problems' },
    { label: 'Competencias', value: stats.contests, icon: IconTrophy, gradient: 'from-accent-600/20 to-accent-500/5', accent: 'text-accent-400', link: '/contests' },
    { label: 'Mis Envíos', value: stats.submissions, icon: IconSend, gradient: 'from-emerald-600/20 to-emerald-500/5', accent: 'text-emerald-400', link: '/submissions' },
    { label: 'Equipos', value: stats.teams, icon: IconUsers, gradient: 'from-violet-600/20 to-violet-500/5', accent: 'text-violet-400', link: '/teams' },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`¡Hola, ${user?.first_name || user?.username}!`}
        subtitle="Resumen de tu actividad en la plataforma"
        icon={<IconDashboard className="w-5 h-5" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="card-hover group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-surface-400 text-xs font-display font-medium uppercase tracking-wider">{card.label}</p>
                  <p className="text-3xl font-display font-bold text-surface-100 mt-1.5">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center ${card.accent} opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110 duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competencias Activas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-section text-surface-100 flex items-center gap-2">
              <IconTrophy className="w-5 h-5 text-accent-400" />
              Competencias Activas
            </h2>
            <Link to="/contests" className="text-primary-400 text-sm hover:text-primary-300 font-display font-medium transition-colors">
              Ver todas →
            </Link>
          </div>
          {activeContests.length > 0 ? (
            <div className="space-y-2.5">
              {activeContests.map((contest: any) => (
                <Link
                  key={contest.id}
                  to={`/contests/${contest.id}`}
                  className="block p-3.5 rounded-xl bg-surface-900/50 hover:bg-surface-800 border border-transparent hover:border-primary-500/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-surface-100 font-display font-medium">{contest.title}</p>
                      <p className="text-surface-500 text-xs mt-1 flex items-center gap-1">
                        <IconUsers className="w-3.5 h-3.5" />
                        {contest.participant_count} participantes
                      </p>
                    </div>
                    <span className="badge bg-emerald-400/10 text-emerald-400 border border-emerald-400/15">En curso</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<IconTrophy className="w-7 h-7" />}
              title="Sin competencias activas"
              description="No hay competencias en curso en este momento"
            />
          )}
        </div>

        {/* Envíos Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-section text-surface-100 flex items-center gap-2">
              <IconSend className="w-5 h-5 text-primary-400" />
              Envíos Recientes
            </h2>
            <Link to="/submissions" className="text-primary-400 text-sm hover:text-primary-300 font-display font-medium transition-colors">
              Ver todos →
            </Link>
          </div>
          {recentSubmissions.length > 0 ? (
            <div className="space-y-2.5">
              {recentSubmissions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-xl bg-surface-900/50">
                  <div>
                    <p className="text-surface-200 text-sm font-medium">{sub.problem_title}</p>
                    <p className="text-surface-500 text-xs mt-0.5 flex items-center gap-1">
                      <IconClock className="w-3 h-3" />
                      {sub.language_display} · {new Date(sub.submitted_at).toLocaleString('es-BO')}
                    </p>
                  </div>
                  <span className={`font-mono font-bold text-sm ${verdictColor[sub.verdict] || 'text-surface-400'}`}>
                    {sub.verdict}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<IconSend className="w-7 h-7" />}
              title="Sin envíos aún"
              description="Resuelve tu primer problema para ver tu historial"
            />
          )}
        </div>
      </div>
    </div>
  );
}
