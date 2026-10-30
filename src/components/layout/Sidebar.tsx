import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Award,
  CreditCard,
  ShieldAlert,
  Settings,
  Sparkles,
  Megaphone,
  Tag,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Pro Grants', href: '/subscriptions', icon: Award },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Promo Codes', href: '/promo-codes', icon: Tag },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Audit Trail', href: '/audit-logs', icon: ShieldAlert },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-border bg-surface-200/95 backdrop-blur flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">WINTER ARC</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/20 text-primary-light border border-primary/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">Admin Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary-light border border-primary/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-border">
        <div className="p-3 rounded-lg bg-surface-100 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-xs font-medium text-slate-200">Backend Online</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ed25519 Engine</span>
            <span className="text-accent-cyan font-mono text-[10px]">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
