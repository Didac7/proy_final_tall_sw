/**
 * Página de Login — con background geométrico y tipografía Outfit.
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Credenciales inválidas. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-slide-up z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-5 shadow-2xl shadow-primary-600/30 ring-1 ring-white/10">
            <span className="text-white font-display font-extrabold text-2xl">IC</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-surface-100 tracking-tight">ICPC UAGRM</h1>
          <p className="text-surface-400 mt-1.5 text-sm font-display">Plataforma de Programación Competitiva</p>
        </div>

        {/* Login Form */}
        <div className="card backdrop-blur-sm bg-surface-850/80">
          <h2 className="text-section text-surface-100 mb-6 font-display">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm animate-scale-in" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-username" className="label">Usuario</label>
              <input
                id="login-username"
                type="text"
                className="input"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="label">Contraseña</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="animate-pulse-soft">Ingresando...</span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold font-display transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-surface-600 mt-8 font-display tracking-wide">
          UAGRM — FICCT — Ingeniería Informática
        </p>
      </div>
    </div>
  );
}
