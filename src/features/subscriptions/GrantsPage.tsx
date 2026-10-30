import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { SubscriptionGrant, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, ChevronRight, RefreshCw, ExternalLink, Download } from 'lucide-react';

export const GrantsPage: React.FC = () => {
  const [grantsPage, setGrantsPage] = useState<Page<SubscriptionGrant> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  const toast = useToast();

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const data = await api.getAllGrants({ page, size: 15, status: status || undefined });
      setGrantsPage(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch grants');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      toast.info('Generating grants CSV export...');
      await api.exportGrantsCsv();
      toast.success('Complimentary grants CSV downloaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Complimentary Pro Grants</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manual and promotional licenses granted without payment processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGrants}
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

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-border bg-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="rounded-lg bg-surface-200 border border-border px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="">All Grants</option>
            <option value="ACTIVE">Active</option>
            <option value="EXTENDED">Extended</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Grants: <span className="text-white font-semibold">{grantsPage?.totalElements || 0}</span>
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-3.5">Recipient User</th>
                  <th className="px-6 py-3.5">Tier & Type</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Grant Reason</th>
                  <th className="px-6 py-3.5">Admin Issuer</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {grantsPage && grantsPage.content.length > 0 ? (
                  grantsPage.content.map((grant) => (
                    <tr key={grant.id} className="hover:bg-surface-200/50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/users/${grant.userId}`}
                          className="font-medium text-slate-200 hover:text-primary-light flex items-center gap-1 font-mono"
                        >
                          <span>{grant.userEmail}</span>
                          <ExternalLink className="h-3 w-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono font-medium text-slate-200 block">{grant.tier}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{grant.grantType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {grant.durationDays ? `${grant.durationDays} Days` : 'Lifetime'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            grant.status === 'ACTIVE'
                              ? 'success'
                              : grant.status === 'REVOKED'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {grant.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={grant.reason}>
                        {grant.reason}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                        {grant.adminEmail}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/users/${grant.userId}`}
                          className="text-xs text-primary-light hover:underline font-medium"
                        >
                          Manage User
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        title="No Complimentary Grants Found"
                        description="No complimentary Pro licenses match the selected criteria."
                        action={
                          status
                            ? {
                                label: 'Clear Filter',
                                onClick: () => {
                                  setStatus('');
                                  setPage(0);
                                },
                              }
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {grantsPage && grantsPage.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Page {grantsPage.number + 1} of {grantsPage.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={grantsPage.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={grantsPage.last}
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
