'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    setLoading(true);
    const res = await apiClient<any>('/dashboard/overview');
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReports();
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

  const total = metrics.totalLeads || 1;
  const conversionRate = total > 0 ? ((metrics.convertedLeads / total) * 100).toFixed(1) : '0.0';
  const contactedRate = total > 0 ? (((metrics.contactedLeads + metrics.convertedLeads) / total) * 100).toFixed(1) : '0.0';

  const statusReports = [
    { status: 'NEW', label: 'New Uncontacted', count: metrics.newLeads, color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { status: 'CONTACTED', label: 'Contacted', count: metrics.contactedLeads, color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { status: 'INTERESTED', label: 'Interested Prospects', count: metrics.interestedLeads, color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { status: 'FOLLOW_UP', label: 'Follow-up Scheduled', count: metrics.followUpLeads, color: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { status: 'CONVERTED', label: 'Converted Clients', count: metrics.convertedLeads, color: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    { status: 'ARCHIVED', label: 'Archived Records', count: metrics.archivedLeads, color: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

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
                CRM Pipeline & Conversion Reports
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Conversion analytics, lead velocity, and source attribution reports
              </p>
            </div>
            <button
              onClick={loadReports}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Refresh Reports
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Database Leads</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : (metrics.totalLeads + metrics.archivedLeads).toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">Across all active & archived submissions</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Conversion Rate</span>
              <p className="text-2xl font-bold text-teal-600 mt-1">{loading ? '...' : `${conversionRate}%`}</p>
              <p className="text-[11px] text-slate-400 mt-1">{metrics.convertedLeads} converted of {metrics.totalLeads} active</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Contacted Velocity</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">{loading ? '...' : `${contactedRate}%`}</p>
              <p className="text-[11px] text-slate-400 mt-1">Response engagement rate</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Action Required</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">{loading ? '...' : (metrics.newLeads + metrics.followUpLeads).toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">New leads + scheduled follow-ups</p>
            </div>
          </div>

          {/* REPORTS TABLE 1: Pipeline Breakdown by Status */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Lead Pipeline Status Report</h3>
                <p className="text-xs text-slate-500">Distribution of leads across sales pipeline stages</p>
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden p-3 space-y-2.5">
              {statusReports.map((item) => {
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                return (
                  <div key={item.status} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${item.badge}`}>
                        {item.status}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.count.toLocaleString()} leads</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{item.label}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-1 text-right">
                      <Link
                        href={item.status === 'ARCHIVED' ? '/leads?archived=true' : `/leads?status=${item.status}`}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Filter Leads &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tablet & Desktop View: Table with Horizontal Scroll */}
            <div className="hidden md:block overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 min-w-[130px] whitespace-nowrap">Status Code</th>
                    <th className="px-4 py-3 min-w-[160px] whitespace-nowrap">Pipeline Stage</th>
                    <th className="px-4 py-3 min-w-[100px] whitespace-nowrap">Lead Count</th>
                    <th className="px-4 py-3 min-w-[180px] whitespace-nowrap">Pipeline Share</th>
                    <th className="px-4 py-3 min-w-[100px] whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusReports.map((item) => {
                    const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                    return (
                      <tr key={item.status} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.badge}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {item.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full ${item.color} rounded-full`}
                                style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Link
                            href={item.status === 'ARCHIVED' ? '/leads?archived=true' : `/leads?status=${item.status}`}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                          >
                            View Leads
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* REPORTS TABLE 2: Form Performance Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Form Attribution Report</h3>
                <p className="text-xs text-slate-500">Volume breakdown by original WordPress WPForms form name</p>
              </div>
              <Link href="/forms" className="text-xs text-blue-600 font-medium hover:underline">
                Manage Forms
              </Link>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden p-3 space-y-2">
              {data?.formDistribution && data.formDistribution.length > 0 ? (
                data.formDistribution.map((form: any) => (
                  <div key={form.formName} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{form.formName}</p>
                      <p className="text-[10px] text-slate-500">WPForms Source</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs shrink-0">
                      {form.count.toLocaleString()} submissions
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">No form data synced yet.</p>
              )}
            </div>

            {/* Tablet & Desktop View */}
            <div className="hidden md:block overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 min-w-[200px] whitespace-nowrap">WordPress Form Name</th>
                    <th className="px-4 py-3 min-w-[140px] whitespace-nowrap">Total Submissions</th>
                    <th className="px-4 py-3 min-w-[140px] whitespace-nowrap">Integration Type</th>
                    <th className="px-4 py-3 min-w-[120px] whitespace-nowrap">Data Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.formDistribution && data.formDistribution.length > 0 ? (
                    data.formDistribution.map((form: any) => (
                      <tr key={form.formName} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                          {form.formName}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {form.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          HMAC Webhook + Pull API
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Immutable
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                        No submissions recorded yet.
                      </td>
                    </tr>
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
