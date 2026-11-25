'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Clock,
  Archive,
  RefreshCw,
  ShieldCheck,
  X,
  Activity,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { useSidebar } from '@/components/layout/SidebarContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Leads', href: '/leads', icon: Users },
  { name: 'Follow-ups', href: '/leads?status=FOLLOW_UP', icon: Clock },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Forms', href: '/forms', icon: FileSpreadsheet },
  { name: 'Users', href: '/users', icon: UserCheck },
  { name: 'Synchronization', href: '/sync', icon: RefreshCw },
  { name: 'Archived Leads', href: '/leads?archived=true', icon: Archive },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebar();

  const renderNavItems = () => (
    <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        CRM Management
      </div>
      {navigation.map((item) => {
        const isActive =
          item.href === '/leads'
            ? pathname === '/leads'
            : item.href.startsWith('/leads?')
            ? false
            : pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMobile}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col shrink-0 min-h-screen sticky top-0 h-screen z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            SV
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">SV Stock Research</h1>
            <p className="text-xs text-slate-500 font-medium truncate">CRM & Lead Portal</p>
          </div>
        </div>

        {/* Desktop Nav */}
        {renderNavItems()}

        {/* Bottom status badge */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium truncate">Render Cloud Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile Off-canvas Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-white flex flex-col h-full shadow-2xl">
            {/* Mobile Header with Close Button */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  SV
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">SV Stock Research</h1>
                  <p className="text-xs text-slate-500 font-medium">CRM Portal</p>
                </div>
              </div>
              <button
                onClick={closeMobile}
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav */}
            {renderNavItems()}

            {/* Mobile Bottom status badge */}
            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Render Cloud Active</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
