'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RefreshCw, Play, Pause, CheckCircle2, AlertCircle, Database, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingImport, setStartingImport] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSyncInfo() {
    setLoading(true);
    const res = await apiClient<any>('/sync/status');
    if (res.success && res.data) {
      setSyncStatus(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSyncInfo();
  }, []);

  const handleStartImport = async () => {
    setStartingImport(true);
    setMessage(null);
    const res = await apiClient<any>('/sync/import/start', { method: 'POST' });
    if (res.success) {
      setMessage('Historical import job scheduled. Batch synchronization in progress.');
      loadSyncInfo();
    } else {
      setMessage(`Failed to start import: ${res.message || 'Error'}`);
    }
    setStartingImport(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 space-y-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Synchronization & Historical Import</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage data synchronization between WordPress (svstockresearch.in) and Render PostgreSQL CRM
            </p>
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Connection Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WordPress Site</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">svstockresearch.in</p>
              <p className="text-xs text-slate-500 mt-1">WPForms 1.9.1.4 • SV Stock CRM Bridge</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL Database</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">Render PostgreSQL</p>
              <p className="text-xs text-slate-500 mt-1">Prisma ORM • Immutable Source Storage</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Webhook Security</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  HMAC-SHA256
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">Server-to-Server</p>
              <p className="text-xs text-slate-500 mt-1">Timestamp verified • Replay protected</p>
            </div>
          </div>

          {/* Historical Import Control Panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Historical WPForms Entries Importer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Import existing WPForms entries in safe paginated batches without overloading WordPress
                </p>
              </div>
              <button
                onClick={handleStartImport}
                disabled={startingImport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition"
              >
                <Play className="h-4 w-4" />
                {startingImport ? 'Scheduling...' : 'Start Historical Import'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>
                  <strong>Data Protection Guaranteed:</strong> Never modifies, deletes, or overwrites original WordPress WPForms records.
                </span>
              </div>
              <span>Batch size: 50 records per request</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
