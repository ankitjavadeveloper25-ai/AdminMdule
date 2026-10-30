import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { AdminAuditLog, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, ChevronRight, RefreshCw, Eye, Download } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logsPage, setLogsPage] = useState<Page<AdminAuditLog> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [action, setAction] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const toast = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({ page, size: 20, action: action || undefined });
      setLogsPage(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      toast.info('Generating audit logs CSV export...');
      await api.exportAuditLogsCsv();
      toast.success('Audit logs CSV downloaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable log of all privileged operations, grants, and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
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
          <span className="text-xs text-slate-400">Action Type:</span>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            className="rounded-lg bg-surface-200 border border-border px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="">All Actions</option>
            <option value="GRANT_COMPLIMENTARY">Grant Complimentary</option>
            <option value="EXTEND_SUBSCRIPTION">Extend Subscription</option>
            <option value="REVOKE_SUBSCRIPTION">Revoke Subscription</option>
            <option value="SUSPEND_USER">Suspend User</option>
            <option value="ACTIVATE_USER">Activate User</option>
            <option value="UPDATE_USER_ROLE">Update Role</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Events: <span className="text-white font-semibold">{logsPage?.totalElements || 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200 border-b border-border text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Acting Admin</th>
                  <th className="px-6 py-3.5">Target Account</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Outcome</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logsPage && logsPage.content.length > 0 ? (
                  logsPage.content.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-200/50">
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            log.action.includes('GRANT')
                              ? 'primary'
                              : log.action.includes('SUSPEND') || log.action.includes('REVOKE')
                              ? 'danger'
                              : 'accent'
                          }
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {log.adminEmail}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {log.targetUserEmail || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={log.reason}>
                        {log.reason || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={log.outcome === 'SUCCESS' ? 'success' : 'danger'}>
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        title="No Audit Logs Found"
                        description="No administrative operations match the selected criteria."
                        action={
                          action
                            ? {
                                label: 'Reset Filter',
                                onClick: () => {
                                  setAction('');
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
        {logsPage && logsPage.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Page {logsPage.number + 1} of {logsPage.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={logsPage.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={logsPage.last}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Details"
        subtitle={`Event ID: ${selectedLog?.id}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-surface-200 border border-border space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Action:</span>
                <span className="text-white font-semibold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Acting Administrator:</span>
                <span className="text-slate-200">{selectedLog.adminEmail} ({selectedLog.adminId})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Target Account:</span>
                <span className="text-slate-200">{selectedLog.targetUserEmail || 'N/A'} ({selectedLog.targetUserId || 'N/A'})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mandatory Reason:</span>
                <span className="text-accent-amber font-sans italic">{selectedLog.reason || 'None provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Audit Details Payload:</span>
                <pre className="p-2 rounded bg-surface-300 text-slate-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.details || 'No additional details captured'}
                </pre>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IP Address:</span>
                <span className="text-slate-300">{selectedLog.ipAddress || 'Internal Call'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
