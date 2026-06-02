/**
 * Spinner de carga reutilizable con aria-live para accesibilidad.
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-[2px]',
  md: 'w-8 h-8 border-[2.5px]',
  lg: 'w-12 h-12 border-[3px]',
};

export default function Spinner({ size = 'md', label = 'Cargando...', className = '' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`} role="status" aria-live="polite">
      <div className={`${sizeMap[size]} border-primary-500/30 border-t-primary-400 rounded-full animate-spin`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
