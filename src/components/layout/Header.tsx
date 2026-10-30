import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-surface-200/50 backdrop-blur px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">Environment:</span>
        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
          Standalone Spring Boot
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-slate-100 flex items-center gap-1.5">
                <span>{user.fullName || user.email}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="ml-2 p-2 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
