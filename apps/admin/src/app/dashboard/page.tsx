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
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const res = await apiClient<any>('/dashboard/overview');
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
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
    { title: 'Total Active Leads', value: metrics.totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'New Leads', value: metrics.newLeads, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Contacted', value: metrics.contactedLeads, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Interested', value: metrics.interestedLeads, icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Follow-ups Required', value: metrics.followUpLeads, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Converted Clients', value: metrics.convertedLeads, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Archived Leads', value: metrics.archivedLeads, icon: Archive, color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 space-y-8 flex-1">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Management Overview</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time metrics from SV Stock Research WordPress & Render Synchronization Engine
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sync"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition"
              >
                <RefreshCw className="h-4 w-4 text-slate-500" />
                Sync Status
              </Link>
              <Link
                href="/leads"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <Users className="h-4 w-4" />
                View All Leads
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loading ? '...' : card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Distribution sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Distribution Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                WPForms Distribution
              </h3>
              <div className="space-y-3">
                {data?.formDistribution && data.formDistribution.length > 0 ? (
                  data.formDistribution.map((form: any) => (
                    <div key={form.formName} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-sm font-medium text-slate-700">{form.formName}</span>
                      <span className="text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                        {form.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic py-6 text-center">
                    No form submissions synced yet. Start the historical import on the Synchronization page.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">WordPress WPForms Live Integration</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The CRM securely synchronizes new submissions via HMAC-SHA256 signed webhooks directly from
                  WordPress plugin <span className="font-semibold text-slate-800">SV Stock CRM Bridge</span>.
                  Original WPForms entries are preserved immutably.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
                <span>Target: Render Web Service</span>
                <span className="font-semibold text-emerald-600">Zero WPForms modifications</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
