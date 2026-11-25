'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  UserCheck,
  ShieldCheck,
  UserPlus,
  Search,
  Mail,
  Shield,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const mockAdmins: AdminUserItem[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@svstockresearch.in',
    role: 'SUPER_ADMIN',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Research Analyst',
    email: 'analyst@svstockresearch.in',
    role: 'ADMIN',
    isActive: true,
    lastLoginAt: '2026-11-24T14:30:00Z',
    createdAt: '2026-11-05T12:00:00Z',
  },
  {
    id: '3',
    name: 'Sales Executive',
    email: 'sales@svstockresearch.in',
    role: 'AGENT',
    isActive: true,
    lastLoginAt: '2026-11-25T09:15:00Z',
    createdAt: '2026-11-10T08:30:00Z',
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>(mockAdmins);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Admin
          </span>
        );
      case 'AGENT':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Agent
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
                Admin Users & Team Access
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage CRM administrative roles, agent permissions, and active sessions
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition self-start sm:self-auto"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin User
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>

          {/* DATA VIEW 1: Mobile Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{user.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      {user.email}
                    </p>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Last Active</span>
                    <span className="text-slate-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                  >
                    Edit Access
                  </button>
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
                    <th className="px-5 py-3 min-w-[180px] whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 min-w-[200px] whitespace-nowrap">Email Address</th>
                    <th className="px-4 py-3 min-w-[130px] whitespace-nowrap">Role</th>
                    <th className="px-4 py-3 min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 min-w-[150px] whitespace-nowrap">Last Login</th>
                    <th className="px-4 py-3 min-w-[100px] whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition"
                        >
                          Manage
                        </button>
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
