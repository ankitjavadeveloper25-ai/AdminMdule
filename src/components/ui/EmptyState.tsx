import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'No matching data matches your query or no records have been created yet.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-border/70 bg-surface-100/60 backdrop-blur-md">
      <div className="relative mb-5 group">
        <div className="absolute -inset-2 bg-gradient-to-r from-accent-cyan/20 to-primary/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
        <img
          src="/assets/empty-state.png"
          alt="No records"
          className="relative w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_10px_25px_rgba(56,189,248,0.25)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
