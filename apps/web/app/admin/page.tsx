'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Users, UserCheck, Activity, CheckCircle, Clock, Building, Plus, Search, ShieldCheck } from 'lucide-react';

const ADMIN_STATS = [
  { label: 'Total Users', value: '12,847', change: '+8.3%', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Verified Users', value: '9,214', change: '+5.1%', icon: UserCheck, color: 'text-teal-600 bg-teal-50' },
  { label: 'Active Rides', value: '341', change: '+12.4%', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Completed Trips', value: '48,392', change: '+3.7%', icon: CheckCircle, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Pending Verifications', value: '278', change: '-14.2%', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { label: 'Universities', value: '47', change: '+2', icon: Building, color: 'text-purple-600 bg-purple-50' },
];

const ADMIN_UNIVERSITIES = [
  { id: 'u1', name: 'Lovely Professional University', domain: 'lpu.in', users: 2341, status: 'active' },
  { id: 'u2', name: 'IIT Delhi', domain: 'iitd.ac.in', users: 3012, status: 'active' },
  { id: 'u3', name: 'BITS Pilani', domain: 'bits-pilani.ac.in', users: 1876, status: 'active' },
  { id: 'u4', name: 'Delhi University', domain: 'du.ac.in', users: 4521, status: 'active' },
  { id: 'u5', name: 'Manipal University', domain: 'manipal.edu', users: 1234, status: 'active' },
  { id: 'u6', name: 'State College Campus', domain: 'college.edu', users: 987, status: 'active' },
];

export default function AdminDashboardPage() {
  const [search, setSearch] = useState('');

  const filteredUnivs = ADMIN_UNIVERSITIES.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd] rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> PLATFORM CONTROL PANEL
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Admin Dashboard & Campus Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time platform metrics, institutional email domains, and user verification queues
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ADMIN_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600">{stat.change}</span>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">{stat.value}</div>
                  <div className="text-[11px] text-slate-500">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* University Management Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1e3a8a]">Verified Campus Institutions</h2>
              <p className="text-xs text-slate-500">Active email domains permitted for user registration</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search university or domain..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3">Institution Name</th>
                  <th className="p-3">Email Domain</th>
                  <th className="p-3">Registered Users</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnivs.map((univ) => (
                  <tr key={univ.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{univ.name}</td>
                    <td className="p-3 font-mono text-slate-600">@{univ.domain}</td>
                    <td className="p-3 font-bold text-[#1e3a8a]">{univ.users.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-bold text-[10px]">
                        {univ.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
