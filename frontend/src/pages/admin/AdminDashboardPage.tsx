/**
 * Panel de Administración unificado y premium para la Plataforma ICPC UAGRM.
 * Permite gestionar problemas, casos de prueba, competencias, equipos, usuarios y ver estadísticas.
 */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import {
  IconDashboard, IconCode, IconTrophy, IconUsers,
  IconUser, IconSend, IconCheck, IconTarget, IconKey, IconClose
} from '../../components/ui/Icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

type ActiveTab = 'stats' | 'problems' | 'contests' | 'teams' | 'users';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin' || user?.role_name === 'admin';
  const isCoach = (user as any)?.role === 'coach' || user?.role_name === 'coach';

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('problems');
  const [loading, setLoading] = useState(false);

  // Stats data
  const [statsData, setStatsData] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Problems CRUD
  const [problems, setProblems] = useState<any[]>([]);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: '', description: '', input_format: '', output_format: '',
    sample_input: '', sample_output: '', difficulty: 'medium',
    time_limit_ms: 1000, memory_limit_kb: 262144, is_public: true,
    is_active: true, tags: ''
  });

  // Test cases state for editing problem
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newTestCase, setNewTestCase] = useState({
    input_data: '', expected_output: '', is_sample: false, order: 0
  });

  // Contests CRUD
  const [contests, setContests] = useState<any[]>([]);
  const [editingContest, setEditingContest] = useState<any>(null);
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestForm, setContestForm] = useState({
    title: '', description: '', start_time: '', end_time: '',
    scoring_type: 'icpc', penalty_time: 20, is_public: true
  });

  // Contest problems state
  const [contestProblems, setContestProblems] = useState<any[]>([]);
  const [newContestProblem, setNewContestProblem] = useState({
    problem: '', label: 'A', order: 0
  });

  // Teams CRUD
  const [teams, setTeams] = useState<any[]>([]);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '', coach: ''
  });

  // Team members
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newTeamMember, setNewTeamMember] = useState({
    user_id: '', role: 'member'
  });

  // Users & Roles
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // Search/Filters
  const [problemSearch, setProblemSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Load basic entities
  useEffect(() => {
    if (activeTab === 'problems') loadProblems();
    if (activeTab === 'contests') loadContests();
    if (activeTab === 'teams') {
      loadTeams();
      loadUsersList(); // For adding members
    }
    if (activeTab === 'users') {
      loadUsersList();
      loadRolesList();
    }
    if (activeTab === 'stats') loadStats();
  }, [activeTab]);

  // Global Stats Loader
  const loadStats = async () => {
    if (!isAdmin) {
      setStatsError('Únicamente los administradores del sistema pueden ver las métricas globales del servidor.');
      return;
    }
    setLoading(true);
    setStatsError(null);
    try {
      const res = await api.get('/stats/global/');
      setStatsData(res.data);
    } catch (err: any) {
      setStatsError(err.response?.data?.detail || 'Error al obtener estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  // Problems API
  const loadProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/problems/');
      setProblems(res.data.results || res.data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleCreateOrUpdateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProblem) {
        await api.put(`/problems/${editingProblem.id}/`, problemForm);
      } else {
        await api.post('/problems/', problemForm);
      }
      setShowProblemModal(false);
      setEditingProblem(null);
      loadProblems();
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data) || 'Error al guardar el problema.');
    }
  };

  const handleEditProblem = async (prob: any) => {
    setEditingProblem(prob);
    setProblemForm({
      title: prob.title, description: prob.description,
      input_format: prob.input_format || '', output_format: prob.output_format || '',
      sample_input: prob.sample_input || '', sample_output: prob.sample_output || '',
      difficulty: prob.difficulty, time_limit_ms: prob.time_limit_ms,
      memory_limit_kb: prob.memory_limit_kb, is_public: prob.is_public,
      is_active: prob.is_active, tags: prob.tags || ''
    });
    setTestCases([]);
    setShowProblemModal(true);

    // Fetch test cases
    setLoadingModalData(true);
    try {
      const res = await api.get(`/problems/${prob.id}/testcases/`);
      setTestCases(res.data || []);
    } catch { /* empty */ }
    setLoadingModalData(false);
  };

  const handleAddTestCase = async () => {
    if (!newTestCase.input_data.trim() || !newTestCase.expected_output.trim() || !editingProblem) return;
    try {
      await api.post(`/problems/${editingProblem.id}/testcases/`, newTestCase);
      setNewTestCase({ input_data: '', expected_output: '', is_sample: false, order: testCases.length });
      // Reload test cases
      const res = await api.get(`/problems/${editingProblem.id}/testcases/`);
      setTestCases(res.data || []);
    } catch {
      alert('Error al agregar el caso de prueba.');
    }
  };

  // Contests API
  const loadContests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contests/');
      setContests(res.data.results || res.data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleCreateOrUpdateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert dates to ISO String if needed
    try {
      if (editingContest) {
        await api.put(`/contests/${editingContest.id}/`, contestForm);
      } else {
        await api.post('/contests/', contestForm);
      }
      setShowContestModal(false);
      setEditingContest(null);
      loadContests();
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data) || 'Error al guardar la competencia.');
    }
  };

  const handleEditContest = async (contest: any) => {
    setEditingContest(contest);
    // Format dates for input datetime-local (YYYY-MM-DDThh:mm)
    const fmtDate = (dStr: string) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setContestForm({
      title: contest.title, description: contest.description || '',
      start_time: fmtDate(contest.start_time), end_time: fmtDate(contest.end_time),
      scoring_type: contest.scoring_type, penalty_time: contest.penalty_time,
      is_public: contest.is_public
    });
    setContestProblems([]);
    setShowContestModal(true);
    
    // Load problems and contest problems
    setLoadingModalData(true);
    try {
      const pRes = await api.get(`/contests/${contest.id}/problems/`);
      setContestProblems(pRes.data || []);
      // Load general problems list if not loaded yet
      const genProb = await api.get('/problems/');
      setProblems(genProb.data.results || genProb.data || []);
    } catch { /* empty */ }
    setLoadingModalData(false);
  };

  const handleAddContestProblem = async () => {
    if (!newContestProblem.problem || !editingContest) return;
    try {
      await api.post(`/contests/${editingContest.id}/problems/`, {
        problem: Number(newContestProblem.problem),
        label: newContestProblem.label,
        order: Number(newContestProblem.order)
      });
      setNewContestProblem({ problem: '', label: 'A', order: contestProblems.length });
      // Reload contest problems
      const res = await api.get(`/contests/${editingContest.id}/problems/`);
      setContestProblems(res.data || []);
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data) || 'Error al asignar problema.');
    }
  };

  // Teams API
  const loadTeams = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/teams/');
      setTeams(res.data.results || res.data || []);
    } catch { /* empty */ }
    if (!silent) setLoading(false);
  };

  const handleCreateOrUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam.id}/`, teamForm);
      } else {
        await api.post('/teams/', teamForm);
      }
      setShowTeamModal(false);
      setEditingTeam(null);
      loadTeams();
    } catch {
      alert('Error al guardar el equipo.');
    }
  };

  const handleEditTeam = async (team: any) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name, coach: team.coach || ''
    });
    setTeamMembers(team.members || []);
    setShowTeamModal(true);

    setLoadingModalData(true);
    try {
      const res = await api.get(`/teams/${team.id}/`);
      setTeamMembers(res.data.members || []);
    } catch { /* empty */ }
    setLoadingModalData(false);
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.user_id || !editingTeam) return;
    try {
      await api.post(`/teams/${editingTeam.id}/add_member/`, {
        user_id: Number(newTeamMember.user_id),
        role: newTeamMember.role
      });
      setNewTeamMember({ user_id: '', role: 'member' });
      // Reload team
      const res = await api.get(`/teams/${editingTeam.id}/`);
      setTeamMembers(res.data.members || []);
      loadTeams(true); // Recargar la lista de fondo para actualizar el contador de integrantes silenciosamente
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al agregar miembro.');
    }
  };

  const handleRemoveTeamMember = async (memId: number) => {
    if (!editingTeam) return;
    if (!confirm('¿Seguro que deseas remover a este miembro del equipo?')) return;
    try {
      await api.delete(`/teams/${editingTeam.id}/remove_member/${memId}/`);
      // Reload team
      const res = await api.get(`/teams/${editingTeam.id}/`);
      setTeamMembers(res.data.members || []);
      loadTeams(true); // Recargar la lista de fondo para actualizar el contador de integrantes silenciosamente
    } catch {
      alert('Error al remover miembro.');
    }
  };

  // Users & Roles APIs
  const loadUsersList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/');
      setUsersList(res.data.results || res.data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const loadRolesList = async () => {
    try {
      const res = await api.get('/roles/');
      setRolesList(res.data.results || res.data || []);
    } catch { /* empty */ }
  };

  const handleToggleUserActive = async (userObj: any) => {
    try {
      if (userObj.is_active) {
        await api.delete(`/users/${userObj.id}/`); // Soft delete
      } else {
        await api.post(`/users/${userObj.id}/activate/`);
      }
      loadUsersList();
    } catch {
      alert('Error al cambiar el estado del usuario.');
    }
  };

  const handleChangeUserRole = async (userId: number, roleId: number) => {
    try {
      await api.post(`/users/${userId}/change_role/`, { role_id: roleId });
      loadUsersList();
    } catch {
      alert('Error al cambiar el rol.');
    }
  };

  const deleteProblem = async (probId: number) => {
    if (!confirm('¿Deseas deshabilitar/eliminar este problema del banco?')) return;
    try {
      await api.delete(`/problems/${probId}/`);
      loadProblems();
    } catch {
      alert('Error al eliminar problema.');
    }
  };

  const deleteContest = async (contId: number) => {
    if (!confirm('¿Deseas eliminar permanentemente esta competencia?')) return;
    try {
      await api.delete(`/contests/${contId}/`);
      loadContests();
    } catch {
      alert('Error al eliminar competencia.');
    }
  };

  // Constants
  const tabs = [
    { id: 'stats', label: 'Estadísticas Globales', icon: <IconDashboard className="w-4 h-4" />, visible: isAdmin },
    { id: 'problems', label: 'Banco de Problemas', icon: <IconCode className="w-4 h-4" />, visible: true },
    { id: 'contests', label: 'Competencias', icon: <IconTrophy className="w-4 h-4" />, visible: true },
    { id: 'teams', label: 'Equipos / Grupos', icon: <IconUsers className="w-4 h-4" />, visible: true },
    { id: 'users', label: 'Control de Usuarios', icon: <IconUser className="w-4 h-4" />, visible: isAdmin },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Control"
        subtitle={`Gestión de la plataforma ICPC UAGRM — Sesión de ${user?.first_name || user?.username} (${user?.role_display})`}
        icon={<IconKey className="w-5 h-5 text-accent-400" />}
      />

      {/* Tabs Layout */}
      <div className="flex flex-wrap p-1.5 bg-surface-900/60 border border-surface-850/80 rounded-xl gap-1">
        {tabs
          .filter((t) => t.visible)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-display font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
      </div>

      {/* Loader */}
      {loading && activeTab !== 'stats' && (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" label="Cargando datos de administración..." />
        </div>
      )}

      {!loading && (
        <div className="animate-fade-in space-y-6">
          {/* TAB 1: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {statsError ? (
                <EmptyState
                  icon={<IconDashboard className="w-8 h-8 text-red-400" />}
                  title="Acceso Restringido"
                  description={statsError}
                />
              ) : statsData ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card-hover p-4 flex flex-col justify-between h-28">
                      <p className="text-xs text-surface-500 font-display font-medium">Usuarios Registrados</p>
                      <h3 className="text-3xl font-display font-extrabold text-surface-100">{statsData.overview.total_users}</h3>
                      <span className="text-[10px] text-emerald-400">+{statsData.overview.new_users_last_30_days} este mes</span>
                    </div>
                    <div className="card-hover p-4 flex flex-col justify-between h-28">
                      <p className="text-xs text-surface-500 font-display font-medium">Problemas Activos</p>
                      <h3 className="text-3xl font-display font-extrabold text-surface-100">{statsData.overview.total_problems}</h3>
                      <span className="text-[10px] text-primary-400">En el banco de problemas</span>
                    </div>
                    <div className="card-hover p-4 flex flex-col justify-between h-28">
                      <p className="text-xs text-surface-500 font-display font-medium">Competencias Creadas</p>
                      <h3 className="text-3xl font-display font-extrabold text-surface-100">{statsData.overview.total_contests}</h3>
                      <span className="text-[10px] text-accent-400">{statsData.overview.active_contests} torneos en vivo</span>
                    </div>
                    <div className="card-hover p-4 flex flex-col justify-between h-28">
                      <p className="text-xs text-surface-500 font-display font-medium">Envíos Procesados</p>
                      <h3 className="text-3xl font-display font-extrabold text-surface-100">{statsData.overview.total_submissions}</h3>
                      <span className="text-[10px] text-surface-400">{statsData.overview.submissions_last_7_days} esta semana</span>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* LineChart Submissions by Day */}
                    <div className="card space-y-4">
                      <h4 className="text-sm font-bold font-display text-surface-200">Envíos de Soluciones (Últimos 14 Días)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={statsData.charts.submissions_by_day}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(tick) => tick.substring(8,10)} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#131926', borderColor: '#20293a', color: '#f1f5f9' }} />
                            <Line type="monotone" dataKey="count" stroke="#08bea8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* BarChart Verdict Distribution */}
                    <div className="card space-y-4">
                      <h4 className="text-sm font-bold font-display text-surface-200">Distribución de Veredictos del Juez</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statsData.charts.verdict_distribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
                            <XAxis dataKey="verdict" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#131926', borderColor: '#20293a', color: '#f1f5f9' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                              {statsData.charts.verdict_distribution.map((entry: any, index: number) => {
                                const colors: Record<string, string> = { AC: '#10b981', WA: '#ef4444', TLE: '#f59e0b', RE: '#ec4899', CE: '#64748b' };
                                return <Cell key={`cell-${index}`} fill={colors[entry.verdict] || '#3b82f6'} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Top lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card space-y-3">
                      <h4 className="text-sm font-bold font-display text-surface-200">Problemas más resueltos</h4>
                      <div className="table-container">
                        <table className="table">
                          <thead><tr><th>ID</th><th>Título</th><th className="text-right">Resueltos</th></tr></thead>
                          <tbody>
                            {statsData.rankings.top_solved_problems.map((p: any) => (
                              <tr key={p.problem__id}>
                                <td className="font-mono text-xs text-surface-500">#{p.problem__id}</td>
                                <td className="font-medium text-surface-200 text-sm">{p.problem__title}</td>
                                <td className="text-right font-bold text-emerald-400 font-mono text-sm">{p.solve_count} AC</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card space-y-3">
                      <h4 className="text-sm font-bold font-display text-surface-200">Estudiantes con más aciertos</h4>
                      <div className="table-container">
                        <table className="table">
                          <thead><tr><th>Username</th><th>Nombre</th><th className="text-right">Aceptados</th></tr></thead>
                          <tbody>
                            {statsData.rankings.top_users.map((u: any) => (
                              <tr key={u.user__id}>
                                <td className="font-mono text-xs text-primary-400">@{u.user__username}</td>
                                <td className="font-medium text-surface-200 text-sm">{u.user__first_name} {u.user__last_name}</td>
                                <td className="text-right font-bold text-emerald-400 font-mono text-sm">{u.ac_count} envíos</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-center"><Spinner /></div>
              )}
            </div>
          )}

          {/* TAB 2: PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  className="input max-w-xs text-xs"
                  placeholder="Buscar problemas..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                />
                <button
                  onClick={() => {
                    setEditingProblem(null);
                    setProblemForm({
                      title: '', description: '', input_format: '', output_format: '',
                      sample_input: '', sample_output: '', difficulty: 'medium',
                      time_limit_ms: 1000, memory_limit_kb: 262144, is_public: true,
                      is_active: true, tags: ''
                    });
                    setTestCases([]);
                    setShowProblemModal(true);
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <IconCode className="w-4 h-4" />
                  <span>Nuevo Problema</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-16">ID</th>
                      <th>Título</th>
                      <th className="w-24">Dificultad</th>
                      <th className="w-24">Límites</th>
                      <th className="w-24 text-center">Estado</th>
                      <th className="w-32 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems
                      .filter((p) => p.title.toLowerCase().includes(problemSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono text-xs text-surface-500">#{p.id}</td>
                          <td>
                            <span className="font-semibold text-sm text-surface-200 block">{p.title}</span>
                            <span className="text-[10px] text-surface-550 block mt-0.5">{p.tags}</span>
                          </td>
                          <td>
                            <span className={`badge-${p.difficulty}`}>
                              {p.difficulty_display || p.difficulty}
                            </span>
                          </td>
                          <td className="font-mono text-[10px] text-surface-400">
                            {p.time_limit_ms}ms / {(p.memory_limit_kb / 1024).toFixed(0)}MB
                          </td>
                          <td className="text-center">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.is_public ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-800 text-surface-500'}`}>
                              {p.is_public ? 'Público' : 'Privado'}
                            </span>
                          </td>
                          <td className="text-right space-x-2">
                            <button onClick={() => handleEditProblem(p)} className="text-primary-400 hover:text-primary-300 font-semibold text-xs transition-colors">
                              Editar
                            </button>
                            <button onClick={() => deleteProblem(p.id)} className="text-red-400 hover:text-red-300 font-semibold text-xs transition-colors">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTESTS */}
          {activeTab === 'contests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setEditingContest(null);
                    setContestForm({
                      title: '', description: '', start_time: '', end_time: '',
                      scoring_type: 'icpc', penalty_time: 20, is_public: true
                    });
                    setContestProblems([]);
                    setShowContestModal(true);
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <IconTrophy className="w-4 h-4" />
                  <span>Nueva Competencia</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-16">ID</th>
                      <th>Título</th>
                      <th>Horario</th>
                      <th>Reglas</th>
                      <th className="w-24 text-center">Estado</th>
                      <th className="w-32 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contests.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono text-xs text-surface-500">#{c.id}</td>
                        <td className="font-semibold text-sm text-surface-200">{c.title}</td>
                        <td className="text-xs text-surface-400 font-display">
                          {new Date(c.start_time).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })} —{' '}
                          {new Date(c.end_time).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="font-mono text-xs text-primary-400 uppercase tracking-wider">{c.scoring_type} ({c.penalty_time}m)</td>
                        <td className="text-center">
                          <span className={`badge text-[9px] uppercase tracking-wider ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-surface-450 border border-surface-700'}`}>
                            {c.status_display}
                          </span>
                        </td>
                        <td className="text-right space-x-2">
                          <button onClick={() => handleEditContest(c)} className="text-primary-400 hover:text-primary-300 font-semibold text-xs transition-colors">
                            Editar
                          </button>
                          <button onClick={() => deleteContest(c.id)} className="text-red-400 hover:text-red-300 font-semibold text-xs transition-colors">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TEAMS */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setEditingTeam(null);
                    setTeamForm({ name: '', coach: '' });
                    setTeamMembers([]);
                    setShowTeamModal(true);
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <IconUsers className="w-4 h-4" />
                  <span>Nuevo Equipo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((t) => (
                  <div key={t.id} className="card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-surface-850 pb-2">
                        <h4 className="font-display font-bold text-surface-100">{t.name}</h4>
                        <span className="text-xs text-surface-500 font-mono">{t.member_count} miembros</span>
                      </div>
                      {t.coach_name && (
                        <p className="text-xs text-surface-400 mb-2">🎓 Coach: <span className="font-semibold text-surface-200">{t.coach_name}</span></p>
                      )}
                    </div>
                    <button onClick={() => handleEditTeam(t)} className="btn-secondary btn-sm mt-4 text-center">
                      Gestionar Equipo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  className="input max-w-xs text-xs"
                  placeholder="Buscar usuarios..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-16">ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th className="w-32">Rol de Usuario</th>
                      <th className="w-24 text-center">Activo</th>
                      <th className="w-44 text-right">Cambiar Rol / Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter((u) => u.username.toLowerCase().includes(userSearch.toLowerCase()) || `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id}>
                          <td className="font-mono text-xs text-surface-500">#{u.id}</td>
                          <td>
                            <span className="font-semibold text-sm text-surface-200 block">{u.first_name} {u.last_name}</span>
                            <span className="text-[10px] text-primary-400 block font-mono">@{u.username}</span>
                          </td>
                          <td className="text-xs text-surface-400 font-mono">{u.email}</td>
                          <td>
                            <span className="text-xs font-semibold text-surface-300">{u.role_display}</span>
                          </td>
                          <td className="text-center">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {u.is_active ? 'Activo' : 'Baneado'}
                            </span>
                          </td>
                          <td className="text-right flex items-center justify-end gap-2.5">
                            {/* Role Select in row */}
                            <label htmlFor={`role-select-${u.id}`} className="sr-only">Cambiar rol</label>
                            <select
                              id={`role-select-${u.id}`}
                              className="input py-0.5 px-2 text-[10px] w-28 bg-surface-900 border-surface-800"
                              value={u.role || ''}
                              onChange={(e) => handleChangeUserRole(u.id, Number(e.target.value))}
                            >
                              <option value="">Sin Rol</option>
                              {rolesList.map((r) => (
                                <option key={r.id} value={r.id}>{r.display_name}</option>
                              ))}
                            </select>
                            
                            {/* Toggle active state */}
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className={`px-2 py-1 rounded text-[10px] font-bold ${u.is_active ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'}`}
                            >
                              {u.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL 1: PROBLEMS ───────────────────────── */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-950 border border-surface-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setShowProblemModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>

            <div className="border-b border-surface-850 pb-3">
              <h3 className="text-xl font-display font-extrabold text-surface-100">
                {editingProblem ? `Editar Problema #${editingProblem.id}` : 'Crear Nuevo Problema'}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Side */}
              <form onSubmit={handleCreateOrUpdateProblem} className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-surface-400 font-display font-semibold">Título del Problema</label>
                    <input required type="text" className="input" value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Dificultad</label>
                    <select className="input" value={problemForm.difficulty} onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}>
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Temas / Etiquetas (separados por coma)</label>
                    <input type="text" className="input" placeholder="math, dp, greedy" value={problemForm.tags} onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Límite de Tiempo (ms)</label>
                    <input type="number" className="input font-mono" value={problemForm.time_limit_ms} onChange={(e) => setProblemForm({ ...problemForm, time_limit_ms: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Límite de Memoria (KB)</label>
                    <input type="number" className="input font-mono" value={problemForm.memory_limit_kb} onChange={(e) => setProblemForm({ ...problemForm, memory_limit_kb: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-surface-400 font-display font-semibold">Enunciado / Descripción</label>
                  <textarea rows={5} className="input font-sans text-sm" value={problemForm.description} onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Formato de Entrada</label>
                    <textarea rows={2} className="input text-xs" value={problemForm.input_format} onChange={(e) => setProblemForm({ ...problemForm, input_format: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Formato de Salida</label>
                    <textarea rows={2} className="input text-xs" value={problemForm.output_format} onChange={(e) => setProblemForm({ ...problemForm, output_format: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Caso Ejemplo - Entrada</label>
                    <textarea rows={2} className="input text-xs font-mono text-emerald-400" value={problemForm.sample_input} onChange={(e) => setProblemForm({ ...problemForm, sample_input: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Caso Ejemplo - Salida</label>
                    <textarea rows={2} className="input text-xs font-mono text-amber-400" value={problemForm.sample_output} onChange={(e) => setProblemForm({ ...problemForm, sample_output: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-surface-300 font-semibold cursor-pointer">
                    <input type="checkbox" checked={problemForm.is_public} onChange={(e) => setProblemForm({ ...problemForm, is_public: e.target.checked })} />
                    <span>Hacer Público para Estudiantes</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-surface-300 font-semibold cursor-pointer">
                    <input type="checkbox" checked={problemForm.is_active} onChange={(e) => setProblemForm({ ...problemForm, is_active: e.target.checked })} />
                    <span>Activar (Banco de Problemas)</span>
                  </label>
                </div>

                <button type="submit" className="btn-primary w-full py-2.5">
                  {editingProblem ? '💾 Actualizar Datos del Problema' : '🚀 Registrar Problema'}
                </button>
              </form>

              {/* Test Cases Manager (only if problem is already created/editing) */}
              <div className="lg:col-span-5 border-l border-surface-850 pl-0 lg:pl-6 space-y-4">
                <h4 className="font-display font-bold text-surface-200 text-sm border-b border-surface-850 pb-2">
                  Gestión de Casos del Juez (Test Cases)
                </h4>

                {editingProblem ? (
                  <>
                    {loadingModalData ? (
                      <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {testCases.map((tc, index) => (
                          <div key={tc.id || index} className="p-3 bg-surface-900 rounded-xl border border-surface-850 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary-400">Prueba #{index + 1} {tc.is_sample && '💡 (Ejemplo)'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                              <div><span className="text-surface-555">Input:</span> <pre className="bg-surface-950 p-1 rounded border border-surface-800 overflow-x-auto truncate">{tc.input_data}</pre></div>
                              <div><span className="text-surface-555">Expected:</span> <pre className="bg-surface-950 p-1 rounded border border-surface-800 overflow-x-auto truncate">{tc.expected_output}</pre></div>
                            </div>
                          </div>
                        ))}
                        {testCases.length === 0 && (
                          <p className="text-xs text-surface-500 italic">No hay casos de evaluación cargados para este problema. Agrega uno abajo.</p>
                        )}
                      </div>
                    )}

                    {/* New test case form */}
                    <div className="p-3 bg-surface-900/60 rounded-2xl border border-surface-800 space-y-3">
                      <p className="text-xs font-bold font-display text-surface-300">Cargar Nueva Prueba de Evaluación</p>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold font-display">Entrada de Prueba (Input)</label>
                        <textarea rows={2} className="input text-xs font-mono bg-surface-950 border-surface-850 text-emerald-400" value={newTestCase.input_data} onChange={(e) => setNewTestCase({ ...newTestCase, input_data: e.target.value })} />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold font-display">Salida Esperada (Expected Output)</label>
                        <textarea rows={2} className="input text-xs font-mono bg-surface-950 border-surface-850 text-amber-400" value={newTestCase.expected_output} onChange={(e) => setNewTestCase({ ...newTestCase, expected_output: e.target.value })} />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-surface-400 cursor-pointer">
                          <input type="checkbox" checked={newTestCase.is_sample} onChange={(e) => setNewTestCase({ ...newTestCase, is_sample: e.target.checked })} />
                          <span>Es de Ejemplo</span>
                        </label>
                        <button type="button" onClick={handleAddTestCase} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all">
                          ＋ Cargar Caso
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-surface-900 rounded-2xl text-center text-xs text-surface-555">
                    Guarda primero los datos generales del problema para poder cargar las pruebas de evaluación del juez automático.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: CONTESTS ───────────────────────── */}
      {showContestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-950 border border-surface-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setShowContestModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>

            <div className="border-b border-surface-850 pb-3">
              <h3 className="text-xl font-display font-extrabold text-surface-100">
                {editingContest ? `Editar Competencia #${editingContest.id}` : 'Crear Nueva Competencia'}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Contest general form */}
              <form onSubmit={handleCreateOrUpdateContest} className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-surface-400 font-display font-semibold">Título de Competencia</label>
                  <input required type="text" className="input" value={contestForm.title} onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-surface-400 font-display font-semibold">Descripción del Torneo</label>
                  <textarea rows={3} className="input text-sm" value={contestForm.description} onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Fecha e Hora de Inicio</label>
                    <input required type="datetime-local" className="input text-xs font-mono" value={contestForm.start_time} onChange={(e) => setContestForm({ ...contestForm, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Fecha e Hora de Fin</label>
                    <input required type="datetime-local" className="input text-xs font-mono" value={contestForm.end_time} onChange={(e) => setContestForm({ ...contestForm, end_time: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Scoring Rules</label>
                    <select className="input" value={contestForm.scoring_type} onChange={(e) => setContestForm({ ...contestForm, scoring_type: e.target.value })}>
                      <option value="icpc">ICPC (Penalización)</option>
                      <option value="ioi">IOI (Puntos parciales)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-surface-400 font-display font-semibold">Penalización ICPC (minutos por fallo)</label>
                    <input type="number" className="input" value={contestForm.penalty_time} onChange={(e) => setContestForm({ ...contestForm, penalty_time: Number(e.target.value) })} />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-surface-300 font-semibold cursor-pointer">
                  <input type="checkbox" checked={contestForm.is_public} onChange={(e) => setContestForm({ ...contestForm, is_public: e.target.checked })} />
                  <span>Publicar en la lista general de competencias</span>
                </label>

                <button type="submit" className="btn-primary w-full py-2.5 shadow-lg shadow-primary-500/10">
                  {editingContest ? '💾 Guardar Datos del Torneo' : '🏆 Lanzar Competencia'}
                </button>
              </form>

              {/* Contest Problems Connector */}
              <div className="lg:col-span-5 border-l border-surface-850 pl-0 lg:pl-6 space-y-4">
                <h4 className="font-display font-bold text-surface-200 text-sm border-b border-surface-850 pb-2">
                  Problemas del Torneo
                </h4>

                {editingContest ? (
                  <>
                    {loadingModalData ? (
                      <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                    ) : (
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {contestProblems.map((cp) => (
                          <div key={cp.id} className="flex items-center justify-between p-2.5 bg-surface-900 border border-surface-850 rounded-xl text-xs font-display">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-400 font-mono text-sm bg-surface-950/40 w-7 h-7 flex items-center justify-center rounded">
                                {cp.label}
                              </span>
                              <span className="text-surface-200 font-semibold">{cp.problem_detail?.title || `Problema #${cp.problem}`}</span>
                            </div>
                          </div>
                        ))}
                        {contestProblems.length === 0 && (
                          <p className="text-xs text-surface-500 italic">No hay problemas vinculados a esta competencia todavía.</p>
                        )}
                      </div>
                    )}

                    {/* Problem connector form */}
                    <div className="p-3 bg-surface-900/60 rounded-2xl border border-surface-800 space-y-3">
                      <p className="text-xs font-bold font-display text-surface-300">Asignar Problema del Banco</p>
                      
                      <div className="space-y-1">
                        <label htmlFor="problem-assign-select" className="text-[10px] text-surface-500 font-semibold font-display">Seleccionar Problema</label>
                        <select
                          id="problem-assign-select"
                          className="input text-xs"
                          value={newContestProblem.problem}
                          onChange={(e) => setNewContestProblem({ ...newContestProblem, problem: e.target.value })}
                        >
                          <option value="">Elige un problema...</option>
                          {problems.map((p) => (
                            <option key={p.id} value={p.id}>[{p.difficulty.toUpperCase()}] {p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="problem-label-input" className="text-[10px] text-surface-500 font-semibold font-display">Letra / Etiqueta</label>
                          <input id="problem-label-input" type="text" className="input text-xs font-mono" value={newContestProblem.label} onChange={(e) => setNewContestProblem({ ...newContestProblem, label: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="problem-order-input" className="text-[10px] text-surface-500 font-semibold font-display">Orden numérico</label>
                          <input id="problem-order-input" type="number" className="input text-xs font-mono" value={newContestProblem.order} onChange={(e) => setNewContestProblem({ ...newContestProblem, order: Number(e.target.value) })} />
                        </div>
                      </div>

                      <button type="button" onClick={handleAddContestProblem} className="btn-primary w-full py-1.5 text-xs">
                        ＋ Vincular Problema al Torneo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-surface-900 rounded-2xl text-center text-xs text-surface-555">
                    Guarda primero los datos de la competencia para poder asignarle problemas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: TEAMS ──────────────────────────── */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-950 border border-surface-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setShowTeamModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>

            <div className="border-b border-surface-850 pb-3">
              <h3 className="text-xl font-display font-extrabold text-surface-100">
                {editingTeam ? `Gestionar Equipo: ${editingTeam.name} (${teamMembers.length} integrantes)` : 'Crear Nuevo Equipo'}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form side */}
              <form onSubmit={handleCreateOrUpdateTeam} className="lg:col-span-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-surface-400 font-display font-semibold">Nombre del Equipo</label>
                  <input required type="text" className="input" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="team-coach-select" className="text-xs text-surface-400 font-display font-semibold">Asignar Coach (Docente / Entrenador)</label>
                  <select
                    id="team-coach-select"
                    className="input text-sm"
                    value={teamForm.coach}
                    onChange={(e) => setTeamForm({ ...teamForm, coach: e.target.value })}
                  >
                    <option value="">Ninguno</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>[{u.role_display}] {u.first_name} {u.last_name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full py-2">
                  {editingTeam ? '💾 Actualizar Datos del Equipo' : '🚀 Crear Equipo'}
                </button>
              </form>

              {/* Members Manager Side */}
              <div className="lg:col-span-6 border-l border-surface-850 pl-0 lg:pl-6 space-y-4">
                <h4 className="font-display font-bold text-surface-200 text-sm border-b border-surface-850 pb-2">
                  Miembros Integrantes ({teamMembers.length})
                </h4>

                {editingTeam ? (
                  <>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {teamMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2.5 bg-surface-900 border border-surface-850 rounded-xl text-xs font-display">
                          <div>
                            <span className="text-surface-200 font-bold block">{m.full_name || m.username}</span>
                            <span className="text-surface-500 font-mono text-[9px] uppercase">{m.role_display}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveTeamMember(m.user)} className="text-red-400 hover:text-red-300 font-semibold">
                            Remover
                          </button>
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <p className="text-xs text-surface-500 italic">No hay integrantes en este equipo todavía.</p>
                      )}
                    </div>

                    {/* Member connector */}
                    <div className="p-3 bg-surface-900/60 rounded-2xl border border-surface-800 space-y-3">
                      <p className="text-xs font-bold font-display text-surface-300">Vincular Alumno</p>
                      
                      <div className="space-y-1">
                        <label htmlFor="member-add-select" className="text-[10px] text-surface-500 font-semibold font-display">Seleccionar Alumno</label>
                        <select
                          id="member-add-select"
                          className="input text-xs"
                          value={newTeamMember.user_id}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, user_id: e.target.value })}
                        >
                          <option value="">Elige un estudiante...</option>
                          {usersList.map((u) => (
                            <option key={u.id} value={u.id}>@{u.username} — {u.first_name} {u.last_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="member-role-select" className="text-[10px] text-surface-500 font-semibold font-display">Rol en el Equipo</label>
                        <select
                          id="member-role-select"
                          className="input text-xs"
                          value={newTeamMember.role}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                        >
                          <option value="member">Titular</option>
                          <option value="alternate">Suplente</option>
                        </select>
                      </div>

                      <button type="button" onClick={handleAddTeamMember} className="btn-primary w-full py-1.5 text-xs">
                        ＋ Agregar Alumno al Equipo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-surface-900 rounded-2xl text-center text-xs text-surface-555">
                    Guarda primero los datos básicos del equipo para poder gestionar a sus integrantes.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
