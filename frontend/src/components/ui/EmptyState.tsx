/**
 * Estado vacío reutilizable con icono, título, subtítulo y CTA opcional.
 */
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/40 flex items-center justify-center mb-5 text-surface-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-surface-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
