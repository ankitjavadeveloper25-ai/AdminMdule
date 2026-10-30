import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary-light border-primary/20',
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    danger: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    neutral: 'bg-surface-50 text-slate-300 border-border',
    accent: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
