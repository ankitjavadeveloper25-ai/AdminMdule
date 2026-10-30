import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DashboardStats } from '../../types';
import { CardSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Award,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Administration Overview</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time metrics from Spring Boot backend</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-surface-100 border border-border text-center">
        <AlertCircle className="h-8 w-8 text-accent-rose mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-200">Unable to load metrics</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 rounded-lg bg-surface-50 hover:bg-surface-200 text-xs text-slate-200 font-medium transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const tierBadges: Record<string, string> = {
    FREE: '/assets/badge-free.png',
    PRO_MONTHLY: '/assets/badge-pro-monthly.png',
    PRO_YEARLY: '/assets/badge-pro-yearly.png',
    LIFETIME: '/assets/badge-lifetime.png',
  };

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner with Canva Visual */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface-100 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/assets/hero-banner.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />

        <div className="relative z-10 p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-primary/20 text-primary-light border border-primary/30">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
              <span>Winter ARC Mission Control</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Executive Telemetry & Licensing Console
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Authoritative administration platform for managing user entitlements, cryptographic Ed25519 token signatures, Stripe/Razorpay settlements, and complimentary access.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/users"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5"
            >
              <Users className="h-4 w-4" />
              <span>Browse Users</span>
            </Link>
            <Link
              to="/subscriptions"
              className="px-3.5 py-2 rounded-lg bg-surface-50/80 hover:bg-surface-200 text-slate-200 border border-border text-xs font-medium transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Award className="h-4 w-4 text-accent-cyan" />
              <span>Grant Pro Access</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">System Performance Metrics</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Authoritative telemetry calculated directly from SQL persistence</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 border border-border text-xs text-slate-300 hover:text-white hover:bg-surface-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-xl border border-border bg-surface-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Registered Users</span>
            <Users className="h-4 w-4 text-primary-light" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalUsers.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent-emerald">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats?.newUsersPast7Days} joined this week</span>
          </div>
        </div>

        {/* Active Pro Subscribers */}
        <div className="rounded-xl border border-border bg-surface-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Pro Entitlements</span>
            <Award className="h-4 w-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.activeProSubscribers.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Free: {stats?.freeSubscribers}</span>
            <span>Active: {stats?.activeSubscriptions}</span>
          </div>
        </div>

        {/* Complimentary Pro Grants */}
        <div className="rounded-xl border border-border bg-surface-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Complimentary Pro Grants</span>
            <ShieldCheck className="h-4 w-4 text-accent-amber" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.complimentaryGrantsCount.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Active non-payment VIP & tester licenses
          </div>
        </div>

        {/* Verified Revenue */}
        <div className="rounded-xl border border-border bg-surface-100 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Verified Payment Revenue</span>
            <CreditCard className="h-4 w-4 text-accent-emerald" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(stats?.totalRevenueCents || 0)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Stripe & Razorpay webhook-settled
          </div>
        </div>
      </div>

      {/* Grid: Subscription Distribution & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Distribution Breakdown */}
        <div className="rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-white mb-4">Entitlement Breakdown</h2>
          <div className="space-y-3.5">
            {Object.entries(stats?.subscriptionDistribution || {}).map(([tier, count]) => {
              const total = stats?.totalSubscriptions || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={tier}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={tierBadges[tier] || '/assets/badge-free.png'}
                        alt={tier}
                        className="h-5 w-5 object-contain drop-shadow"
                      />
                      <span className="font-mono text-slate-300 font-medium">{tier}</span>
                    </div>
                    <span className="text-slate-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-50 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tier === 'LIFETIME'
                          ? 'bg-accent-cyan'
                          : tier.startsWith('PRO')
                          ? 'bg-primary'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Suspended Accounts:</span>
            <Badge variant={stats?.suspendedUsers ? 'danger' : 'neutral'}>
              {stats?.suspendedUsers} Suspended
            </Badge>
          </div>
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Administrative Operations</h2>
            <Link
              to="/audit-logs"
              className="text-xs text-primary-light hover:underline flex items-center gap-1"
            >
              <span>View full audit log</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAuditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-surface-200 border border-border/60 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          log.action.includes('GRANT')
                            ? 'primary'
                            : log.action.includes('SUSPEND')
                            ? 'danger'
                            : 'accent'
                        }
                      >
                        {log.action}
                      </Badge>
                      <span className="text-slate-300 font-medium">{log.targetUserEmail || 'System'}</span>
                    </div>
                    {log.reason && (
                      <p className="text-slate-400 text-[11px] italic">"{log.reason}"</p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No administrative operations logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
