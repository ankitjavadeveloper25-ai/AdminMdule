import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { PromoCode, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  Tag,
  Plus,
  RefreshCw,
  Power,
  ChevronLeft,
  ChevronRight,
  Percent,
} from 'lucide-react';

export const PromoCodesPage: React.FC = () => {
  const [pageData, setPageData] = useState<Page<PromoCode>>({
    content: [],
    pageable: { pageNumber: 0, pageSize: 15 },
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
    empty: true,
    size: 15,
    number: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [tierGrant, setTierGrant] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [maxRedemptions, setMaxRedemptions] = useState<number>(100);
  const [validDays, setValidDays] = useState<number>(30);

  const toast = useToast();

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const data = await api.getPromoCodes({ page, size: 15 });
      setPageData(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Promo code name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPromoCode({
        code: code.trim().toUpperCase(),
        discountPercent,
        tierGrant: tierGrant || undefined,
        durationDays: tierGrant ? durationDays : undefined,
        maxRedemptions,
        validDays,
      });
      toast.success(`Promo code "${code.trim().toUpperCase()}" created successfully!`);
      setIsModalOpen(false);
      setCode('');
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.togglePromoCode(id);
      toast.info(`Promo code ${updated.code} is now ${updated.active ? 'active' : 'paused'}`);
      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle promo code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-accent-cyan" />
            <h1 className="text-xl font-bold text-white tracking-tight">Promotional & Referral Codes</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Issue discount coupons, student campaign vouchers, and VIP trial access codes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPromoCodes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border bg-surface-100/90 backdrop-blur-md overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200 border-b border-border text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Coupon Code</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Tier Trial</th>
                  <th className="px-6 py-3.5">Redemptions</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Expires</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pageData.content && pageData.content.length > 0 ? (
                  pageData.content.map((promo) => (
                    <tr key={promo.id} className="hover:bg-surface-200/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-accent-cyan tracking-wider flex items-center gap-1.5">
                          <span>{promo.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                        {promo.discountPercent > 0 ? (
                          <span className="flex items-center gap-0.5 text-accent-emerald">
                            <Percent className="h-3.5 w-3.5" />
                            <span>{promo.discountPercent}% OFF</span>
                          </span>
                        ) : (
                          '0% (Trial Only)'
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 text-[11px]">
                        {promo.tierGrant ? (
                          <Badge variant="primary">{`${promo.tierGrant} (${promo.durationDays || 14}d)`}</Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 text-[11px]">
                        {promo.timesRedeemed} / {promo.maxRedemptions}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={promo.active ? 'success' : 'neutral'}>
                          {promo.active ? 'ACTIVE' : 'PAUSED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggle(promo.id)}
                          title={promo.active ? 'Pause Promo Code' : 'Activate Promo Code'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            promo.active
                              ? 'border-accent-amber/30 text-accent-amber hover:bg-accent-amber/10'
                              : 'border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/10'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        title="No Promotional Codes"
                        description="Create discount coupons or special campaign codes for your challengers."
                        action={{
                          label: 'Generate First Promo Code',
                          onClick: () => setIsModalOpen(true),
                        }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pageData.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Page {pageData.number + 1} of {pageData.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pageData.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pageData.last}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Promo Code */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Code"
        subtitle="Generates an authoritative discount code stored in database"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Coupon Code (Uppercase)</label>
            <input
              type="text"
              required
              placeholder="e.g. WINTER50 or PLACEMENT2026"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl bg-surface-200 border border-border px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Discount Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full rounded-xl bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary pr-8"
                />
                <Percent className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Max Redemptions</label>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                className="w-full rounded-xl bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Trial Entitlement (Optional)</label>
              <select
                value={tierGrant}
                onChange={(e) => setTierGrant(e.target.value)}
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value="">None (Discount only)</option>
                <option value="PRO_MONTHLY">Pro Monthly Trial</option>
                <option value="PRO_YEARLY">Pro Yearly Trial</option>
              </select>
            </div>

            {tierGrant ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Trial Days</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-xl bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Code Validity Period</label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>365 Days (1 Year)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/70">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-50 text-xs text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Promo Code'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
