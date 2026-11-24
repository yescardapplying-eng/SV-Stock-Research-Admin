'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Search,
  Filter,
  Download,
  Eye,
  Archive,
  Phone,
  Mail,
  Calendar,
  X,
  MessageSquare,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected lead modal drawer
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

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
      // Reload lead details
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
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 space-y-6 flex-1">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {archived ? 'Archived Leads' : 'All Synchronized Leads'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Total {totalItems.toLocaleString()} records collected across WPForms
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setArchived(!archived);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                  archived
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {archived ? 'Viewing Archived Leads (Click for Active)' : 'Show Archived Leads'}
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </form>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
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
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Lead Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Trading Segment</th>
                    <th className="px-4 py-3">Form Name</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
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
                          <td className="px-5 py-3 font-semibold text-slate-900">
                            {norm.fullName || 'Anonymous'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                            {norm.phone || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{norm.state || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{norm.tradingSegment || '-'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{lead.formName}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(lead.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openLeadDrawer(lead)}
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

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Lead Details Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedLead.sourceEntry?.normalizedFields?.fullName || selectedLead.normalizedFields?.fullName || 'Lead Details'}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  WPForms #{selectedLead.sourceEntry?.wpFormId || selectedLead.wpFormId} • Entry #{selectedLead.sourceEntry?.wpEntryId || selectedLead.wpEntryId}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  CRM Lead Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'NOT_INTERESTED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead.id, st)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                        selectedLead.status === st
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Immutable Original Source Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Original Form Submission (Immutable Source)
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Untouched Record
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Form Name</span>
                    <span className="font-semibold text-slate-800">{selectedLead.sourceEntry?.formName || selectedLead.formName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submitted At</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedLead.sourceEntry?.submittedAt || selectedLead.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Internal CRM Notes
                </h3>
                <form onSubmit={handleAddNote} className="mb-4">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an internal follow-up note..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="flex justify-end mt-2">
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((n: any) => (
                      <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <p className="text-slate-800">{n.note}</p>
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

              {/* Archive / Restore Action */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Data protection: Original WordPress entry is never deleted.
                </span>
                {selectedLead.isArchived ? (
                  <button
                    onClick={() => handleRestore(selectedLead.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                  >
                    Restore Lead
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive(selectedLead.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
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
