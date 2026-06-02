/**
 * SVG Icon set — Accesibles, consistentes, 20x20 viewBox.
 * Cada icono acepta className para sizing/color.
 */

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

const defaults: IconProps = { className: 'w-5 h-5', 'aria-hidden': true };

export function IconDashboard({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 4.5A2.5 2.5 0 014.5 2h3A2.5 2.5 0 0110 4.5v3A2.5 2.5 0 017.5 10h-3A2.5 2.5 0 012 7.5v-3zM2 14.5A1.5 1.5 0 013.5 13h3A1.5 1.5 0 018 14.5v2A1.5 1.5 0 016.5 18h-3A1.5 1.5 0 012 16.5v-2zM12 2.5A1.5 1.5 0 0113.5 1h3A1.5 1.5 0 0118 2.5v4A1.5 1.5 0 0116.5 8h-3A1.5 1.5 0 0112 6.5v-4zM11 12.5A2.5 2.5 0 0113.5 10h3a2.5 2.5 0 012.5 2.5v3a2.5 2.5 0 01-2.5 2.5h-3A2.5 2.5 0 0111 15.5v-3z"/>
    </svg>
  );
}

export function IconCode({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 14 2 10 6 6" /><polyline points="14 6 18 10 14 14" /><line x1="10" y1="3" x2="10" y2="17" transform="rotate(15, 10, 10)" />
    </svg>
  );
}

export function IconTrophy({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1a.75.75 0 01.75.75v.5h3.5A2.75 2.75 0 0117 5v1a3.25 3.25 0 01-2.57 3.18A5.01 5.01 0 0110.75 12.44V15h2.5a.75.75 0 010 1.5H6.75a.75.75 0 010-1.5h2.5v-2.56A5.01 5.01 0 015.57 9.18 3.25 3.25 0 013 6V5a2.75 2.75 0 012.75-2.75h3.5v-.5A.75.75 0 0110 1z"/>
    </svg>
  );
}

export function IconSend({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3.105 3.29a.75.75 0 01.814-.106l13.5 6.75a.75.75 0 010 1.341l-13.5 6.75a.75.75 0 01-1.064-.87L4.95 10.5H9.25a.75.75 0 000-1.5H4.95L2.855 4.16a.75.75 0 01.25-.87z"/>
    </svg>
  );
}

export function IconUsers({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16a8.01 8.01 0 00-.676-3.218 4.5 4.5 0 016.162 3.043.884.884 0 01-.41.85A7.97 7.97 0 0114.5 18c-1.756 0-3.372-.567-4.686-1.525z"/>
    </svg>
  );
}

export function IconTarget({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconUser({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"/>
    </svg>
  );
}

export function IconKey({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 7a5 5 0 113.61 4.804l-1.903 1.903A1 1 0 019 14H8v1a1 1 0 01-1 1H6v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1.586a1 1 0 01.293-.707L8.196 8.39A5.002 5.002 0 018 7zm5-3a.75.75 0 000 1.5A1.5 1.5 0 0114.5 7 .75.75 0 0016 7a3 3 0 00-3-3z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconChevronLeft({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconChevronRight({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconMenu({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconClose({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
    </svg>
  );
}

export function IconLogout({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconSearch({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconRocket({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-4.482 1.332.75.75 0 01-.461-.461 3.994 3.994 0 011.332-4.482.75.75 0 011.052.134z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M13.703 2.442a1.5 1.5 0 012.121 0l1.734 1.734a1.5 1.5 0 010 2.121l-5.06 5.06a4.5 4.5 0 01-1.768 1.108l-2.186.728a.75.75 0 01-.95-.95l.728-2.186a4.5 4.5 0 011.108-1.768l5.06-5.06z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconCheck({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconClock({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd"/>
    </svg>
  );
}

export function IconDocument({ className = defaults.className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z" clipRule="evenodd"/>
    </svg>
  );
}
