'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FileSpreadsheet, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function FormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForms() {
      const res = await apiClient<any[]>('/forms');
      if (res.success && res.data) {
        setForms(res.data);
      }
      setLoading(false);
    }
    loadForms();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 space-y-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discovered WordPress Forms</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Forms dynamically registered from SV Stock Research WPForms installation
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Form Name</th>
                  <th className="px-4 py-3">WPForms ID</th>
                  <th className="px-4 py-3">Imported Submissions</th>
                  <th className="px-4 py-3">Sync Status</th>
                  <th className="px-4 py-3">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
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
                      <td className="px-5 py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                        {form.formName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">#{form.wpFormId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {form.totalImportedEntries?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {form.lastSyncedAt ? new Date(form.lastSyncedAt).toLocaleString() : 'Pending sync'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
