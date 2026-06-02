/**
 * Página de listado de problemas — con PageHeader, Spinner, EmptyState, SVG icons.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Problem, PaginatedResponse } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { IconCode, IconSearch } from '../../components/ui/Icons';

export default function ProblemListPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { loadProblems(); }, [page, difficulty]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;
      const res = await api.get<PaginatedResponse<Problem>>('/problems/', { params });
      setProblems(res.data.results);
      setTotalCount(res.data.count);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); loadProblems(); };

  const difficultyBadge: Record<string, string> = {
    easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard',
  };
  const difficultyLabel: Record<string, string> = {
    easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problemas"
        subtitle={`${totalCount} problemas disponibles`}
        icon={<IconCode className="w-5 h-5" />}
      />

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input type="text" className="input pl-10" placeholder="Buscar por título..."
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar problemas" />
          </div>
          <select className="input w-full sm:w-auto" value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            aria-label="Filtrar por dificultad">
            <option value="">Todas las dificultades</option>
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
          <button type="submit" className="btn-primary">
            <IconSearch className="w-4 h-4" />
            Buscar
          </button>
        </form>
      </div>

      {/* Problems Table */}
      {loading ? (
        <Spinner />
      ) : problems.length === 0 ? (
        <EmptyState
          icon={<IconCode className="w-7 h-7" />}
          title="No se encontraron problemas"
          description="Intenta cambiar los filtros de búsqueda"
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Título</th>
                <th className="w-28">Dificultad</th>
                <th className="w-32 hidden md:table-cell">Límite</th>
                <th className="w-28 hidden lg:table-cell">Autor</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id}>
                  <td className="text-surface-500 font-mono text-xs">{p.id}</td>
                  <td>
                    <Link to={`/problems/${p.id}`} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                      {p.title}
                    </Link>
                    {p.tags && <p className="text-surface-600 text-xs mt-0.5">{p.tags}</p>}
                  </td>
                  <td><span className={difficultyBadge[p.difficulty]}>{difficultyLabel[p.difficulty]}</span></td>
                  <td className="text-surface-400 text-xs font-mono hidden md:table-cell">{p.time_limit_ms}ms / {(p.memory_limit_kb / 1024).toFixed(0)}MB</td>
                  <td className="text-surface-400 text-sm hidden lg:table-cell">{p.author_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-center gap-2">
          <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span className="btn-ghost btn-sm font-display">Página {page}</span>
          <button className="btn-secondary btn-sm" disabled={problems.length < 20} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}
