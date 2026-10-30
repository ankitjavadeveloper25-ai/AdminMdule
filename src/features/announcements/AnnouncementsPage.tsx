import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Announcement, Page } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import {
  Megaphone,
  Plus,
  RefreshCw,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  Info,
  Wrench,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [pageData, setPageData] = useState<Page<Announcement>>({
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
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('MOTIVATION');
  const [durationDays, setDurationDays] = useState(14);

  const toast = useToast();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements({ page, size: 15 });
      setPageData(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type,
        durationDays,
      });
      toast.success('Announcement broadcast published to desktop clients!');
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.toggleAnnouncement(id);
      toast.info(`Announcement is now ${updated.active ? 'active' : 'paused'}`);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (!window.confirm(`Delete broadcast "${annTitle}"?`)) return;
    try {
      await api.deleteAnnouncement(id);
      toast.success('Announcement deleted.');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete announcement');
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'MOTIVATION':
        return <Flame className="h-4 w-4 text-accent-amber" />;
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4 text-accent-cyan" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-accent-rose" />;
      default:
        return <Info className="h-4 w-4 text-primary-light" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-accent-cyan" />
            <h1 className="text-xl font-bold text-white tracking-tight">Desktop Client Broadcasts</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Push real-time motivation, maintenance warnings, and release notes to active JavaFX desktop users
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnnouncements}
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
            <span>New Broadcast</span>
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
                  <th className="px-6 py-3.5">Broadcast</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Expires</th>
                  <th className="px-6 py-3.5">Published</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pageData.content && pageData.content.length > 0 ? (
                  pageData.content.map((ann) => (
                    <tr key={ann.id} className="hover:bg-surface-200/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-slate-100">{ann.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                          {ann.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                          {getTypeIcon(ann.type)}
                          <span>{ann.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ann.active ? 'success' : 'neutral'}>
                          {ann.active ? 'ACTIVE' : 'PAUSED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 text-[11px]">
                        {new Date(ann.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggle(ann.id)}
                            title={ann.active ? 'Pause Announcement' : 'Activate Announcement'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              ann.active
                                ? 'border-accent-amber/30 text-accent-amber hover:bg-accent-amber/10'
                                : 'border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/10'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id, ann.title)}
                            title="Delete Announcement"
                            className="p-1.5 rounded-lg border border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10 text-xs transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <EmptyState
                        title="No Active Broadcasts"
                        description="Publish announcements to deliver notifications to all JavaFX desktop clients."
                        action={{
                          label: 'Create First Broadcast',
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

      {/* Modal: Create Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast In-App Announcement"
        subtitle="Will be displayed on desktop apps upon background synchronization"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Winter ARC Challenge: Day 45 Sprint!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-surface-200 border border-border px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Broadcast Message</label>
            <textarea
              required
              rows={4}
              placeholder="Full announcement text to show challengers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl bg-surface-200 border border-border p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value="MOTIVATION">Motivation (Daily Sprint)</option>
                <option value="INFO">Information (Tips & Updates)</option>
                <option value="MAINTENANCE">Maintenance (Notice)</option>
                <option value="ALERT">Alert (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-xl bg-surface-200 border border-border px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={90}>90 Days (Full Challenge)</option>
              </select>
            </div>
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
              {isSubmitting ? 'Publishing...' : 'Publish Broadcast'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
