import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-border bg-surface-100 p-5 animate-pulse">
    <div className="h-4 w-28 bg-surface-50 rounded mb-3" />
    <div className="h-8 w-20 bg-surface-50 rounded mb-2" />
    <div className="h-3 w-36 bg-surface-50 rounded" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    <div className="h-10 bg-surface-50 rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-surface-100 rounded-lg" />
    ))}
  </div>
);
