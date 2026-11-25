'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RefreshCw, Play, Pause, CheckCircle2, AlertCircle, Database, Shield, Radio } from 'lucide-react';
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
        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Synchronization & Historical Import
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage data synchronization between WordPress (svstockresearch.in) and PostgreSQL CRM
              </p>
            </div>
            <button
              onClick={loadSyncInfo}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Refresh Status
            </button>
          </div>

          {message && (
            <div className="p-3 sm:p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Connection Overview Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">WordPress Site</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900">svstockresearch.in</p>
              <p className="text-xs text-slate-500 mt-1">WPForms 1.9.1.4 • SV Stock CRM Bridge</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL Database</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900">Render / Neon PostgreSQL</p>
              <p className="text-xs text-slate-500 mt-1">Prisma ORM • Immutable Source Storage</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Webhook Security</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  HMAC-SHA256
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900">Server-to-Server</p>
              <p className="text-xs text-slate-500 mt-1">Timestamp verified • Replay protected</p>
            </div>
          </div>

          {/* Historical Import Control Panel */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Historical WPForms Entries Importer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Import existing WPForms entries in safe paginated batches without overloading WordPress
                </p>
              </div>
              <button
                onClick={handleStartImport}
                disabled={startingImport}
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs disabled:opacity-50 transition w-full sm:w-auto"
              >
                <Play className="h-4 w-4" />
                {startingImport ? 'Scheduling...' : 'Start Historical Import'}
              </button>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Data Protection Guaranteed:</strong> Never modifies, deletes, or overwrites original WordPress WPForms records.
                </span>
              </div>
              <span className="text-slate-400 shrink-0">Batch size: 50 records / request</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
