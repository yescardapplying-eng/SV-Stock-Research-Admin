'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FileSpreadsheet, RefreshCw, CheckCircle, ExternalLink, Calendar, Hash } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function FormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadForms() {
    setLoading(true);
    const res = await apiClient<any[]>('/forms');
    if (res.success && res.data) {
      setForms(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadForms();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Discovered WordPress Forms
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Forms dynamically registered from SV Stock Research WPForms installation
              </p>
            </div>
            <button
              onClick={loadForms}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Refresh Forms
            </button>
          </div>

          {/* DATA VIEW 1: Mobile Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading discovered forms...
              </div>
            ) : forms.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 italic">
                No forms registered yet. Forms will automatically register on first sync or submission.
              </div>
            ) : (
              forms.map((form) => (
                <div key={form.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{form.formName}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">WPForms ID: #{form.wpFormId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Submissions</span>
                      <span className="text-sm font-bold text-slate-900">
                        {form.totalImportedEntries?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last Synced</span>
                      <span className="text-slate-700 text-xs">
                        {form.lastSyncedAt ? new Date(form.lastSyncedAt).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DATA VIEW 2: Tablet & Desktop Horizontal Scroll Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 min-w-[200px] whitespace-nowrap">Form Name</th>
                    <th className="px-4 py-3 min-w-[120px] whitespace-nowrap">WPForms ID</th>
                    <th className="px-4 py-3 min-w-[160px] whitespace-nowrap">Imported Submissions</th>
                    <th className="px-4 py-3 min-w-[120px] whitespace-nowrap">Sync Status</th>
                    <th className="px-4 py-3 min-w-[160px] whitespace-nowrap">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-500">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading discovered forms...
                      </td>
                    </tr>
                  ) : forms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 italic">
                        No forms registered yet. Forms will automatically register on first sync or submission.
                      </td>
                    </tr>
                  ) : (
                    forms.map((form) => (
                      <tr key={form.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                          {form.formName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          #{form.wpFormId}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                          {form.totalImportedEntries?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {form.lastSyncedAt ? new Date(form.lastSyncedAt).toLocaleString() : 'Pending sync'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
