/**
 * Header de página reutilizable con título, subtítulo y acción.
 */
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-page-title text-surface-100">{title}</h1>
          {subtitle && <p className="text-surface-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
