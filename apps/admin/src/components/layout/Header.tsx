'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useSidebar } from '@/components/layout/SidebarContext';

export function Header() {
  const router = useRouter();
  const { toggleMobile } = useSidebar();

  const handleLogout = async () => {
    await apiClient('/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-30">
      {/* Left controls: Mobile menu toggle + Global search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
        <button
          onClick={toggleMobile}
          type="button"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden shrink-0 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-[220px] sm:max-w-xs md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search leads, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">Admin User</p>
            <p className="text-[11px] text-slate-500">Super Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
