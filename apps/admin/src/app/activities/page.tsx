'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Activity,
  Filter,
  RefreshCw,
  Search,
  Clock,
  User,
  CheckCircle,
  FileText,
  Archive,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  action: 'STATUS_CHANGED' | 'NOTE_ADDED' | 'IMPORTED' | 'ARCHIVED' | 'RESTORED' | 'OVERRIDE_APPLIED';
  description: string;
  leadName?: string;
  leadId?: string;
  performedBy: string;
  timestamp: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    action: 'STATUS_CHANGED',
    description: 'Status changed from NEW to CONTACTED after phone call',
    leadName: 'Rajesh Sharma',
    leadId: 'lead-101',
    performedBy: 'Admin User',
    timestamp: '2026-11-25T10:45:00Z',
  },
  {
    id: 'act-2',
    action: 'NOTE_ADDED',
    description: 'Client interested in Equity Nifty Options advisory service',
    leadName: 'Amit Patel',
    leadId: 'lead-102',
    performedBy: 'Sales Executive',
    timestamp: '2026-11-25T09:30:00Z',
  },
  {
    id: 'act-3',
    action: 'IMPORTED',
    description: 'New WPForms submission imported securely via HMAC webhook',
    leadName: 'Priya Verma',
    leadId: 'lead-103',
    performedBy: 'SV Stock CRM Bridge',
    timestamp: '2026-11-25T08:15:00Z',
  },
  {
    id: 'act-4',
    action: 'STATUS_CHANGED',
    description: 'Scheduled callback requested for tomorrow 2 PM',
    leadName: 'Vikram Singh',
    leadId: 'lead-104',
    performedBy: 'Admin User',
    timestamp: '2026-11-24T17:20:00Z',
  },
  {
    id: 'act-5',
    action: 'ARCHIVED',
    description: 'Lead marked as duplicate and safely archived',
    leadName: 'Sunil Mehta',
    leadId: 'lead-105',
    performedBy: 'Super Administrator',
    timestamp: '2026-11-24T14:10:00Z',
  },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');

  const filtered = activities.filter((act) => {
    const matchesAction = !filterAction || act.action === filterAction;
    const matchesSearch =
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      (act.leadName && act.leadName.toLowerCase().includes(search.toLowerCase())) ||
      act.performedBy.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            Status Changed
          </span>
        );
      case 'NOTE_ADDED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            Note Added
          </span>
        );
      case 'IMPORTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            Imported
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            Archived
          </span>
        );
      case 'RESTORED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
            Restored
          </span>
        );
      case 'OVERRIDE_APPLIED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            Override
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            {action}
          </span>
        );
    }
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
                CRM Activities & Audit Trail
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Full chronological history of lead changes, status transitions, and user actions
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search audit trail by lead, description, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Action Types</option>
              <option value="STATUS_CHANGED">Status Changed</option>
              <option value="NOTE_ADDED">Note Added</option>
              <option value="IMPORTED">Imported</option>
              <option value="ARCHIVED">Archived</option>
              <option value="RESTORED">Restored</option>
              <option value="OVERRIDE_APPLIED">Override Applied</option>
            </select>
          </div>

          {/* DATA VIEW 1: Mobile Activity Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filtered.map((act) => (
              <div key={act.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {act.leadName || 'System Event'}
                    </span>
                    <span className="text-[11px] text-slate-500">By {act.performedBy}</span>
                  </div>
                  <div>{getActionBadge(act.action)}</div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {act.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                  <Link href="/leads" className="text-blue-600 font-semibold hover:underline">
                    View Leads &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* DATA VIEW 2: Tablet & Desktop Horizontal Scroll Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 min-w-[140px] whitespace-nowrap">Action Type</th>
                    <th className="px-4 py-3 min-w-[240px] whitespace-nowrap">Description</th>
                    <th className="px-4 py-3 min-w-[150px] whitespace-nowrap">Associated Lead</th>
                    <th className="px-4 py-3 min-w-[150px] whitespace-nowrap">Performed By</th>
                    <th className="px-4 py-3 min-w-[160px] whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 whitespace-nowrap">{getActionBadge(act.action)}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{act.description}</td>
                      <td className="px-4 py-3 text-slate-900 font-semibold whitespace-nowrap">
                        {act.leadName || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{act.performedBy}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
