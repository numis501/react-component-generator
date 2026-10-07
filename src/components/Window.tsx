import type { ReactNode } from 'react';

interface WindowProps {
  title: string;
  label?: string;
  className?: string;
  children: ReactNode;
}

export function Window({ title, label, className = '', children }: WindowProps) {
  return (
    <section className={`win ${className}`} aria-label={label ?? title}>
      <div className="win-titlebar" aria-hidden="true">
        <span className="win-close" />
        <span className="win-title">{title}</span>
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}
