import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import {
  Shield,
  Key,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setIsChanging(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      toast.success(res.message || 'Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System & Security Configuration</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Backend operational parameters, cryptographic keys, and administrator profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Administrator Profile */}
        <div className="rounded-2xl border border-border bg-surface-100/90 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
            <Shield className="h-5 w-5 text-primary-light" />
            <h2 className="text-sm font-semibold text-white">Active Administrator Profile</h2>
          </div>
          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Email</span>
              <span className="text-white font-medium text-sm">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="text-slate-200">{user?.fullName || 'Root System Owner'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Administrator Account ID</span>
              <span className="text-slate-300 text-[11px] truncate block">{user?.id}</span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Assigned Role</span>
                <Badge variant="primary">{user?.role}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Account Status</span>
                <Badge variant="success">{user?.status}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="rounded-2xl border border-border bg-surface-100/90 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
            <KeyRound className="h-5 w-5 text-accent-cyan" />
            <h2 className="text-sm font-semibold text-white">Update Admin Credentials</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 text-[11px]">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 text-[11px]">New Master Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars (Uppercase, lowercase, number, symbol)"
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 text-[11px]">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isChanging}
              className="mt-2 w-full py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {isChanging ? 'Securing Password...' : 'Save New Password'}
            </button>
          </form>
        </div>

        {/* Cryptographic Licensing Engine */}
        <div className="rounded-2xl border border-border bg-surface-100/90 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
            <Key className="h-5 w-5 text-accent-emerald" />
            <h2 className="text-sm font-semibold text-white">Cryptographic Ed25519 Engine</h2>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Algorithm Standard</span>
              <span className="text-slate-200">Ed25519 (Edwards-curve Digital Signature, RFC 8032)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Active Signing Key Identifier</span>
              <span className="text-accent-cyan font-semibold">ed25519-2026-v1</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Offline Grace Window</span>
              <span className="text-slate-200">14 Days (1,209,600 seconds)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Key Isolation</span>
              <span className="text-accent-emerald flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Private key strictly isolated on Spring Boot server (never sent to client)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Guardrails */}
        <div className="rounded-2xl border border-border bg-surface-100/90 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
            <ShieldCheck className="h-5 w-5 text-accent-amber" />
            <h2 className="text-sm font-semibold text-white">Sole-Owner Security Model</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Sole-Administrator Lock</span>
                <span className="text-slate-400 text-[11px]">
                  Only you ({user?.email}) have administrative access. User self-escalation is blocked at backend.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Brute-Force Rate Limiting Active</span>
                <span className="text-slate-400 text-[11px]">
                  Login endpoint automatically throttles after 5 consecutive failures with 5-minute lockout.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Strict HTTP Security Headers</span>
                <span className="text-slate-400 text-[11px]">
                  Frame-Options DENY, XSS-Protection, and Nosniff headers enforced on all responses.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Immutable Audit Trails</span>
                <span className="text-slate-400 text-[11px]">
                  All mutations record actor, timestamp, IP address, and cryptographic justification.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
