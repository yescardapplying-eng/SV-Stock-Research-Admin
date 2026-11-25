'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  X,
  MessageSquare,
  Activity,
  Archive,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

function LeadsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialArchived = searchParams.get('archived') === 'true';

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [archived, setArchived] = useState(initialArchived);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected lead modal drawer
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Sync state when URL params change (e.g., clicking Follow-ups or Archived Leads in sidebar)
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const archivedParam = searchParams.get('archived') === 'true';
    setStatusFilter(statusParam);
    setArchived(archivedParam);
    setPage(1);
  }, [searchParams]);

  async function fetchLeads() {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      pageSize: '15',
      archived: String(archived),
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });

    const res = await apiClient<any>(`/leads?${query.toString()}`);
    if (res.success && res.data) {
      setLeads(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, archived]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const res = await apiClient(`/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      fetchLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleArchive = async (leadId: string) => {
    const res = await apiClient(`/leads/${leadId}/archive`, { method: 'POST' });
    if (res.success) {
      fetchLeads();
      setSelectedLead(null);
    }
  };

  const handleRestore = async (leadId: string) => {
    const res = await apiClient(`/leads/${leadId}/restore`, { method: 'POST' });
    if (res.success) {
      fetchLeads();
      setSelectedLead(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedLead) return;

    setSubmittingNote(true);
    const res = await apiClient(`/leads/${selectedLead.id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note: noteText }),
    });

    if (res.success) {
      setNoteText('');
      const detailRes = await apiClient<any>(`/leads/${selectedLead.id}`);
      if (detailRes.success) {
        setSelectedLead(detailRes.data);
      }
      fetchLeads();
    }
    setSubmittingNote(false);
  };

  const openLeadDrawer = async (lead: any) => {
    const detailRes = await apiClient<any>(`/leads/${lead.id}`);
    if (detailRes.success && detailRes.data) {
      setSelectedLead(detailRes.data);
    } else {
      setSelectedLead(lead);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
      INTERESTED: 'bg-amber-50 text-amber-700 border-amber-200',
      FOLLOW_UP: 'bg-purple-50 text-purple-700 border-purple-200',
      CONVERTED: 'bg-teal-50 text-teal-700 border-teal-200',
      NOT_INTERESTED: 'bg-slate-100 text-slate-600 border-slate-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
          styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1">
          {/* Top Bar - Fully Responsive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {archived
                  ? 'Archived Leads'
                  : statusFilter === 'FOLLOW_UP'
                  ? 'Follow-up Required Leads'
                  : 'All Synchronized Leads'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Total {totalItems.toLocaleString()} records collected across WPForms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setArchived(!archived);
                  setPage(1);
                }}
                type="button"
                className={`w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-lg border transition text-center ${
                  archived
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {archived ? 'Viewing Archived (Show Active)' : 'Show Archived Leads'}
              </button>
            </div>
          </div>

          {/* Filter Bar - Responsive Stacking */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </form>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="FOLLOW_UP">FOLLOW_UP</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <button
                onClick={fetchLeads}
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                title="Refresh leads list"
                aria-label="Refresh leads"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* DATA VIEW 1: Mobile Responsive Card List (< 768px) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 italic">
                No leads found matching current criteria.
              </div>
            ) : (
              leads.map((lead) => {
                const norm = lead.normalizedFields || {};
                return (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {norm.fullName || 'Anonymous'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {lead.formName}
                        </p>
                      </div>
                      <div>{getStatusBadge(lead.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Phone</span>
                        {norm.phone ? (
                          <a
                            href={`tel:${norm.phone}`}
                            className="font-mono text-blue-600 font-medium inline-flex items-center gap-1 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {norm.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Date</span>
                        <span className="text-slate-700">
                          {new Date(lead.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">State</span>
                        <span className="text-slate-700">{norm.state || '-'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Segment</span>
                        <span className="text-slate-700 truncate block">{norm.tradingSegment || '-'}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => openLeadDrawer(lead)}
                        type="button"
                        className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center"
                      >
                        View Details & Notes
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DATA VIEW 2: Tablet & Desktop Horizontal Scroll Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 min-w-[150px] whitespace-nowrap">Lead Name</th>
                    <th className="px-4 py-3 min-w-[130px] whitespace-nowrap">Phone</th>
                    <th className="px-4 py-3 min-w-[100px] whitespace-nowrap">State</th>
                    <th className="px-4 py-3 min-w-[140px] whitespace-nowrap">Trading Segment</th>
                    <th className="px-4 py-3 min-w-[150px] whitespace-nowrap">Form Name</th>
                    <th className="px-4 py-3 min-w-[110px] whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 min-w-[90px] whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading lead records...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                        No leads found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const norm = lead.normalizedFields || {};
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                            {norm.fullName || 'Anonymous'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                            {norm.phone ? (
                              <a
                                href={`tel:${norm.phone}`}
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                {norm.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{norm.state || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {norm.tradingSegment || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{lead.formName}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(lead.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(lead.status)}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => openLeadDrawer(lead)}
                              type="button"
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
              <span>
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{totalPages}</strong> ({totalItems.toLocaleString()} leads)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 font-medium transition"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 font-medium transition"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Pagination (< 768px) */}
          <div className="block md:hidden bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Responsive Lead Details Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div className="min-w-0 pr-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {selectedLead.sourceEntry?.normalizedFields?.fullName ||
                    selectedLead.normalizedFields?.fullName ||
                    'Lead Details'}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  WPForms #{selectedLead.sourceEntry?.wpFormId || selectedLead.wpFormId} • Entry #
                  {selectedLead.sourceEntry?.wpEntryId || selectedLead.wpEntryId}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                type="button"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition shrink-0"
                aria-label="Close lead details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 sm:p-6 space-y-5 flex-1">
              {/* Quick Contact Action Bar */}
              {(selectedLead.sourceEntry?.normalizedFields?.phone || selectedLead.normalizedFields?.phone) && (
                <div className="flex gap-2">
                  <a
                    href={`tel:${
                      selectedLead.sourceEntry?.normalizedFields?.phone || selectedLead.normalizedFields?.phone
                    }`}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    Call Lead
                  </a>
                  {(selectedLead.sourceEntry?.normalizedFields?.email || selectedLead.normalizedFields?.email) && (
                    <a
                      href={`mailto:${
                        selectedLead.sourceEntry?.normalizedFields?.email || selectedLead.normalizedFields?.email
                      }`}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      Email Lead
                    </a>
                  )}
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  CRM Lead Status
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED', 'REJECTED'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedLead.id, st)}
                        type="button"
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                          selectedLead.status === st
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Original Form Submission (Immutable Source) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Original WPForms Submission
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Immutable Record
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Form Name</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLead.sourceEntry?.formName || selectedLead.formName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submitted At</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(
                        selectedLead.sourceEntry?.submittedAt || selectedLead.submittedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">State</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLead.sourceEntry?.normalizedFields?.state ||
                        selectedLead.normalizedFields?.state ||
                        '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Trading Segment</span>
                    <span className="font-semibold text-slate-800">
                      {selectedLead.sourceEntry?.normalizedFields?.tradingSegment ||
                        selectedLead.normalizedFields?.tradingSegment ||
                        '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Internal CRM Notes
                </h3>
                <form onSubmit={handleAddNote} className="mb-3">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add follow-up notes, call summary..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="submit"
                      disabled={submittingNote || !noteText.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-40 transition"
                    >
                      {submittingNote ? 'Saving...' : 'Add Note'}
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((n: any) => (
                      <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <p className="text-slate-800 leading-relaxed">{n.note}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {n.createdBy?.name || 'Admin'} • {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes added yet.</p>
                  )}
                </div>
              </div>

              {/* Lead Activities Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Activity History
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedLead.activities && selectedLead.activities.length > 0 ? (
                    selectedLead.activities.map((act: any) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="text-slate-800 font-medium">{act.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {act.performedBy?.name || 'System'}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Archive / Restore Action */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-xs text-slate-500">
                  Data protection: Original WordPress entry is immutable.
                </span>
                {selectedLead.isArchived ? (
                  <button
                    onClick={() => handleRestore(selectedLead.id)}
                    type="button"
                    className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                  >
                    Restore Lead
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive(selectedLead.id)}
                    type="button"
                    className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                  >
                    Archive Lead
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
