'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle,
  Archive,
  ArrowUpRight,
  RefreshCw,
  FileText,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadMetrics() {
    setLoading(true);
    const res = await apiClient<any>('/dashboard/overview');
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  const metrics = data?.metrics || {
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    interestedLeads: 0,
    followUpLeads: 0,
    convertedLeads: 0,
    archivedLeads: 0,
  };

  const statCards = [
    { title: 'Total Active Leads', value: metrics.totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/leads' },
    { title: 'New Leads', value: metrics.newLeads, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/leads?status=NEW' },
    { title: 'Contacted', value: metrics.contactedLeads, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/leads?status=CONTACTED' },
    { title: 'Interested', value: metrics.interestedLeads, icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50', link: '/leads?status=INTERESTED' },
    { title: 'Follow-ups Required', value: metrics.followUpLeads, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', link: '/leads?status=FOLLOW_UP' },
    { title: 'Converted Clients', value: metrics.convertedLeads, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50', link: '/leads?status=CONVERTED' },
    { title: 'Archived Records', value: metrics.archivedLeads, icon: Archive, color: 'text-slate-600', bg: 'bg-slate-100', link: '/leads?archived=true' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 flex-1">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time overview of incoming WordPress WPForms submissions and CRM pipeline
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadMetrics}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                Refresh Metrics
              </button>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-2xs"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Detailed Reports
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid - Fully Responsive (1 col on mobile, 2 on tablet, 4 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.link}
                  className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-500 truncate">{card.title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                      {loading ? '...' : card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg} ${card.color} shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Detailed Breakdown Tables - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Form Distribution Table */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Form Submissions Breakdown</h3>
                </div>
                <Link href="/forms" className="text-xs text-blue-600 hover:underline font-medium">
                  View All Forms
                </Link>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {data?.formDistribution && data.formDistribution.length > 0 ? (
                  data.formDistribution.map((form: any) => (
                    <div
                      key={form.formName}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 gap-2"
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate min-w-0">
                        {form.formName}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs shrink-0">
                        {form.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic py-6 text-center">
                    No form submissions synced yet. Start the historical import on the Synchronization page.
                  </p>
                )}
              </div>
            </div>

            {/* WordPress WPForms Live Integration Info */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">WordPress WPForms Live Pipeline</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The CRM securely synchronizes new submissions via HMAC-SHA256 signed webhooks directly from
                  WordPress plugin <span className="font-semibold text-slate-800">SV Stock CRM Bridge</span>.
                  Original WPForms entries are preserved immutably.
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-500">Security:</span>
                  <span className="font-mono font-medium text-slate-800">HMAC-SHA256 Signed</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-500">Database Engine:</span>
                  <span className="font-medium text-slate-800">PostgreSQL (Neon / Render)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-500">WordPress Integrity:</span>
                  <span className="font-semibold text-emerald-600">Zero WPForms modifications</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
