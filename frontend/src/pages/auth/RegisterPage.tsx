/**
 * Página de Registro — con background geométrico y tipografía Outfit.
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    university: 'UAGRM',
    faculty: 'FICCT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages || 'Error al registrarse.');
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg animate-slide-up z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-5 shadow-2xl shadow-primary-600/30 ring-1 ring-white/10">
            <span className="text-white font-display font-extrabold text-2xl">IC</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-surface-100 tracking-tight">Crear Cuenta</h1>
          <p className="text-surface-400 mt-1.5 text-sm font-display">Únete a la plataforma ICPC UAGRM</p>
        </div>

        <div className="card backdrop-blur-sm bg-surface-850/80">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm animate-scale-in" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-first-name" className="label">Nombre</label>
                <input id="reg-first-name" name="first_name" type="text" className="input"
                  placeholder="Juan" value={formData.first_name} onChange={handleChange} required autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="reg-last-name" className="label">Apellido</label>
                <input id="reg-last-name" name="last_name" type="text" className="input"
                  placeholder="Pérez" value={formData.last_name} onChange={handleChange} required autoComplete="family-name" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-username" className="label">Nombre de usuario</label>
              <input id="reg-username" name="username" type="text" className="input"
                placeholder="juan.perez" value={formData.username} onChange={handleChange} required autoComplete="username" />
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Correo electrónico</label>
              <input id="reg-email" name="email" type="email" className="input"
                placeholder="juan@uagrm.edu.bo" value={formData.email} onChange={handleChange} required autoComplete="email" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="label">Contraseña</label>
                <input id="reg-password" name="password" type="password" className="input"
                  placeholder="Mín. 8 caracteres" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
              </div>
              <div>
                <label htmlFor="reg-password-confirm" className="label">Confirmar</label>
                <input id="reg-password-confirm" name="password_confirm" type="password" className="input"
                  placeholder="Repetir contraseña" value={formData.password_confirm} onChange={handleChange} required autoComplete="new-password" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-university" className="label">Universidad</label>
                <input id="reg-university" name="university" type="text" className="input"
                  value={formData.university} onChange={handleChange} autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="reg-faculty" className="label">Facultad</label>
                <input id="reg-faculty" name="faculty" type="text" className="input"
                  value={formData.faculty} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <span className="animate-pulse-soft">Registrando...</span> : 'Crear Cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold font-display transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
