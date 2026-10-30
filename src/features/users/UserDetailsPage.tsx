import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { UserDetailView, SubscriptionTier } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ArrowLeft,
  Award,
  Key,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const tierBadges: Record<string, string> = {
  FREE: '/assets/badge-free.png',
  PRO_MONTHLY: '/assets/badge-pro-monthly.png',
  PRO_YEARLY: '/assets/badge-pro-yearly.png',
  LIFETIME: '/assets/badge-lifetime.png',
};

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<UserDetailView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Form states
  const [grantTier, setGrantTier] = useState<SubscriptionTier>('PRO_YEARLY');
  const [grantDuration, setGrantDuration] = useState<number>(365);
  const [grantReason, setGrantReason] = useState<string>('');
  const [grantType, setGrantType] = useState<string>('COMPLIMENTARY');

  const [extendDays, setExtendDays] = useState<number>(30);
  const [extendReason, setExtendReason] = useState<string>('');

  const [revokeReason, setRevokeReason] = useState<string>('');
  const [statusReason, setStatusReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const details = await api.getUserDetails(userId);
      setData(details);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await api.grantComplimentarySubscription(userId, {
        tier: grantTier,
        durationDays: grantTier === 'LIFETIME' ? null : grantDuration,
        grantType,
        reason: grantReason,
      });
      setIsGrantModalOpen(false);
      setGrantReason('');
      setActionSuccess('Complimentary Pro subscription successfully granted!');
      await fetchUserDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to grant subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await api.extendSubscription(userId, extendDays, extendReason);
      setIsExtendModalOpen(false);
      setExtendReason('');
      setActionSuccess('Subscription period successfully extended!');
      await fetchUserDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to extend subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await api.revokeSubscription(userId, revokeReason);
      setIsRevokeModalOpen(false);
      setRevokeReason('');
      setActionSuccess('Subscription successfully revoked.');
      await fetchUserDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !data) return;
    setIsSubmitting(true);
    const newStatus = data.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(userId, newStatus, statusReason);
      setIsStatusModalOpen(false);
      setStatusReason('');
      setActionSuccess(`Account status updated to ${newStatus}.`);
      await fetchUserDetails();
    } catch (err: any) {
      alert(err?.message || 'Failed to update account status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Loading user profile & entitlement records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-xl bg-surface-100 border border-border text-center">
        <AlertTriangle className="h-8 w-8 text-accent-rose mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-white">Error loading user</h2>
        <p className="text-xs text-slate-400 mt-1">{error || 'User not found'}</p>
        <Link
          to="/users"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-50 text-xs font-medium text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
      </div>
    );
  }

  const { user, activeSubscription, grantHistory, entitlementPreview } = data;

  return (
    <div className="space-y-6">
      {/* Back Button & Banner */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users List</span>
        </Link>
        <button
          onClick={fetchUserDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 border border-border text-xs text-slate-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-accent-emerald">
            <CheckCircle className="h-4 w-4" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-accent-emerald/80 hover:text-accent-emerald"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Header Card */}
      <div className="rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-accent-cyan/20 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary-light">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white">{user.fullName || 'Anonymous Challenger'}</h1>
                <Badge variant={user.role === 'ROLE_ADMIN' ? 'primary' : 'neutral'}>
                  {user.role}
                </Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {user.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Account ID: {user.id} • Registered: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick User Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                user.status === 'ACTIVE'
                  ? 'border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10'
                  : 'border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/10'
              }`}
            >
              {user.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Entitlement & Subscription Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subscription Status */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-cyan" />
              <h2 className="text-sm font-semibold text-white">Current Active Subscription</h2>
            </div>
            <Badge
              variant={
                activeSubscription?.tier === 'LIFETIME'
                  ? 'accent'
                  : activeSubscription?.tier.startsWith('PRO')
                  ? 'primary'
                  : 'neutral'
              }
            >
              {activeSubscription?.tier || 'FREE'}
            </Badge>
          </div>

          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-surface-200/90 via-surface-200/50 to-transparent border border-border/70">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent-cyan/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                  <img
                    src={tierBadges[activeSubscription.tier] || '/assets/badge-free.png'}
                    alt={activeSubscription.tier}
                    className="relative h-16 w-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {activeSubscription.tier.replace('_', ' ')}
                    </h3>
                    <Badge variant={activeSubscription.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {activeSubscription.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Provider: <span className="font-mono text-slate-200">{activeSubscription.paymentProvider}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Expires: <span className="text-primary-light font-semibold">{activeSubscription.tier === 'LIFETIME' ? 'Never (Permanent Lifetime Entitlement)' : new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-200 border border-border/70 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Provider</span>
                  <span className="font-mono font-medium text-slate-200">
                    {activeSubscription.paymentProvider}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <Badge variant={activeSubscription.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {activeSubscription.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Period Start</span>
                  <span className="font-mono text-slate-300">
                    {new Date(activeSubscription.currentPeriodStart).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expires At</span>
                  <span className="font-mono text-slate-300 font-semibold">
                    {activeSubscription.tier === 'LIFETIME'
                      ? 'Never (Lifetime)'
                      : new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Subscription */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => setIsGrantModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-colors"
                >
                  Grant Complimentary Pro
                </button>
                {activeSubscription.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => setIsExtendModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg bg-surface-50 hover:bg-surface-200 text-slate-200 border border-border text-xs font-medium transition-colors"
                    >
                      Extend Duration
                    </button>
                    <button
                      onClick={() => setIsRevokeModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg border border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10 text-xs font-medium transition-colors"
                    >
                      Revoke Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-xl bg-surface-200/40 border border-border/60">
              <img
                src={tierBadges.FREE}
                alt="FREE"
                className="h-16 w-16 object-contain opacity-80 drop-shadow"
              />
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-slate-200">Standard Free Challenger</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  This user currently operates on standard Free client features with no active Pro entitlement.
                </p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
              >
                Grant Complimentary Pro
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Ed25519 Token Preview */}
        <div className="rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/70">
            <Key className="h-4 w-4 text-accent-emerald" />
            <h2 className="text-sm font-semibold text-white">Ed25519 Entitlement Engine</h2>
          </div>
          {entitlementPreview ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-surface-200 border border-border/60 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Tier:</span>
                  <span className="text-primary-light font-bold">{entitlementPreview.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signing KeyId:</span>
                  <span className="text-slate-300">{entitlementPreview.keyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Offline Grace:</span>
                  <span className="text-slate-300">
                    {Math.round(entitlementPreview.offlineGracePeriodSeconds / 86400)} Days
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <span className="text-slate-500 block text-[10px] mb-1">Cryptographic Signature:</span>
                  <div className="p-2 rounded bg-surface-300 text-[10px] text-accent-cyan break-all">
                    {entitlementPreview.signature.substring(0, 48)}...
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                This signed payload will be issued automatically when the JavaFX desktop client syncs.
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500">No token issued.</div>
          )}
        </div>
      </div>

      {/* Complimentary Grants History */}
      <div className="rounded-xl border border-border bg-surface-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white mb-4">Complimentary Grant History</h2>
        {grantHistory && grantHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Granted Tier</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Granted By</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {grantHistory.map((grant) => (
                  <tr key={grant.id} className="hover:bg-surface-200/50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-200">{grant.tier}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {grant.durationDays ? `${grant.durationDays} Days` : 'Lifetime'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={grant.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {grant.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={grant.reason}>
                      {grant.reason}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{grant.adminEmail}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {new Date(grant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Complimentary Grants"
            description="No VIP or administrative complimentary subscriptions have been issued to this challenger yet."
            action={{
              label: 'Issue First Grant',
              onClick: () => setIsGrantModalOpen(true),
            }}
          />
        )}
      </div>

      {/* Modal: Grant Complimentary Pro */}
      <Modal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title="Grant Complimentary Pro Access"
        subtitle={`User: ${user.email} (No payment processed)`}
      >
        <form onSubmit={handleGrantSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Subscription Tier</label>
            <select
              value={grantTier}
              onChange={(e) => setGrantTier(e.target.value as SubscriptionTier)}
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
            >
              <option value="PRO_MONTHLY">Pro Monthly</option>
              <option value="PRO_YEARLY">Pro Yearly (Recommended)</option>
              <option value="LIFETIME">Lifetime Pro</option>
            </select>
          </div>

          {grantTier !== 'LIFETIME' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration</label>
              <select
                value={grantDuration}
                onChange={(e) => setGrantDuration(Number(e.target.value))}
                className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value={7}>7 Days (Trial Extension)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={90}>90 Days (Full Winter ARC Challenge)</option>
                <option value={365}>365 Days (1 Full Year)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Grant Type</label>
            <select
              value={grantType}
              onChange={(e) => setGrantType(e.target.value)}
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
            >
              <option value="COMPLIMENTARY">Complimentary Access</option>
              <option value="PROMOTIONAL">Promotional / Campaign Winner</option>
              <option value="VIP_COMP">VIP / Beta Tester</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reason for Grant (Required for Audit Trail)
            </label>
            <textarea
              required
              rows={3}
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="e.g., Granted for bug bounty contribution or placement series beta feedback..."
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsGrantModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-50 hover:bg-surface-200 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || grantReason.trim().length < 3}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Issuing Entitlement...' : 'Confirm Pro Grant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Extend Subscription */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Subscription"
        subtitle={`Current Expiry: ${activeSubscription?.currentPeriodEnd}`}
      >
        <form onSubmit={handleExtendSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Days to Add
            </label>
            <input
              type="number"
              min={1}
              max={3650}
              required
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Extension Reason (Required)
            </label>
            <textarea
              required
              rows={3}
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              placeholder="e.g., Extension granted for hackathon award..."
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsExtendModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-50 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || extendReason.trim().length < 3}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Extending...' : 'Confirm Extension'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Revoke Subscription */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Pro Subscription"
        subtitle="This action will downgrade the user to the Free edition upon next sync."
      >
        <form onSubmit={handleRevokeSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-xs text-accent-rose">
            Revoking access will set subscription status to CANCELLED and mark active grants as REVOKED.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reason for Revocation (Required)
            </label>
            <textarea
              required
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g., User requested refund or terms violation..."
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsRevokeModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-50 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || revokeReason.trim().length < 3}
              className="px-4 py-2 rounded-lg bg-accent-rose hover:bg-rose-600 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Revoking...' : 'Confirm Revocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Account Status (Suspend/Activate) */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={user.status === 'ACTIVE' ? 'Suspend User Account' : 'Reactivate User Account'}
        subtitle={`Target User: ${user.email}`}
      >
        <form onSubmit={handleToggleStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reason for Status Change (Required)
            </label>
            <textarea
              required
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g., Investigation of suspicious login attempts or user unbanning..."
              className="w-full rounded-lg bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-50 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || statusReason.trim().length < 3}
              className={`px-4 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 ${
                user.status === 'ACTIVE' ? 'bg-accent-rose hover:bg-rose-600' : 'bg-accent-emerald hover:bg-emerald-600'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
