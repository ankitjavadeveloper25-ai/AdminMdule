import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { User, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [usersPage, setUsersPage] = useState<Page<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [role, setRole] = useState<string>('');

  const toast = useToast();

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      toast.info('Generating users CSV export...');
      await api.exportUsersCsv();
      toast.success('Users CSV export downloaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.searchUsers({
        page,
        size: 15,
        query: query.trim() || undefined,
        status: status || undefined,
        role: role || undefined,
      });
      setUsersPage(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status, role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Registered accounts, privileges, and entitlement controls
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 border border-border text-xs font-medium transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-accent-cyan" />
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-surface-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email or full name..."
            className="w-full rounded-lg bg-surface-200 border border-border pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="rounded-lg bg-surface-200 border border-border px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(0);
            }}
            className="rounded-lg bg-surface-200 border border-border px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="ROLE_USER">Users</option>
            <option value="ROLE_ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-surface-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200 border-b border-border text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {usersPage && usersPage.content.length > 0 ? (
                  usersPage.content.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-200/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface-50 border border-border flex items-center justify-center text-slate-300 font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">
                              {user.fullName || '—'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'ROLE_ADMIN' ? 'primary' : 'neutral'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-200 text-slate-200 border border-border text-xs font-medium transition-colors"
                        >
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState
                        title="No Users Found"
                        description="No registered challengers match the specified query filters."
                        action={
                          query || status || role
                            ? {
                                label: 'Reset Filter Criteria',
                                onClick: () => {
                                  setQuery('');
                                  setStatus('');
                                  setRole('');
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

        {/* Pagination Footer */}
        {usersPage && usersPage.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Showing {usersPage.number * usersPage.size + 1} to{' '}
              {Math.min((usersPage.number + 1) * usersPage.size, usersPage.totalElements)} of{' '}
              {usersPage.totalElements} users
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={usersPage.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                Page {usersPage.number + 1} of {usersPage.totalPages}
              </span>
              <button
                disabled={usersPage.last}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-surface-200 border border-border text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
