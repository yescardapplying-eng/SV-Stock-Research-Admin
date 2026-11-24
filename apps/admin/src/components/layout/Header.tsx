'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await apiClient('/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      {/* Global Search placeholder */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads by name, phone, or email..."
          className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Admin User</p>
            <p className="text-xs text-slate-500">Super Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
