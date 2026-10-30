import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { PaymentTransaction, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, ChevronRight, RefreshCw, Download } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [paymentsPage, setPaymentsPage] = useState<Page<PaymentTransaction> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  const toast = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments({ page, size: 15 });
      setPaymentsPage(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      toast.info('Generating payments CSV export...');
      await api.exportPaymentsCsv();
      toast.success('Payments CSV downloaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const formatAmount = (amountCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amountCents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Payment Transactions</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Verified Stripe & Razorpay webhook-settled purchases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 border border-border text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-200 border border-border text-xs font-medium transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-accent-cyan" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200 border-b border-border text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Provider & Event ID</th>
                  <th className="px-6 py-3.5">Event Type</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paymentsPage && paymentsPage.content.length > 0 ? (
                  paymentsPage.content.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-200/50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono font-medium text-slate-200 block">
                            {tx.provider}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {tx.eventId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {tx.eventType}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-white">
                        {formatAmount(tx.amountCents, tx.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            tx.status === 'SUCCEEDED'
                              ? 'success'
                              : tx.status === 'REFUNDED'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState
                        title="No Payment Transactions"
                        description="No Stripe or Razorpay webhook settlement transactions have been processed yet."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {paymentsPage && paymentsPage.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Page {paymentsPage.number + 1} of {paymentsPage.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={paymentsPage.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={paymentsPage.last}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
