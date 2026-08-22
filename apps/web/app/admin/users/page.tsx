'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { Users, Search, ShieldCheck, UserCheck } from 'lucide-react';

const INITIAL_USERS = [
  { id: 'usr-1', name: 'Demo Driver', email: 'driver@lpu.in', role: 'DRIVER', status: 'VERIFIED', institution: 'Lovely Professional University' },
  { id: 'usr-2', name: 'Demo Rider', email: 'rider@lpu.in', role: 'RIDER', status: 'VERIFIED', institution: 'Lovely Professional University' },
  { id: 'usr-3', name: 'Alex Morgan', email: 'alex@iitd.ac.in', role: 'RIDER', status: 'VERIFIED', institution: 'IIT Delhi' },
  { id: 'usr-4', name: 'Samantha Reed', email: 'samantha@du.ac.in', role: 'DRIVER', status: 'PENDING', institution: 'Delhi University' },
  { id: 'usr-5', name: 'Rahul Sharma', email: 'rahul@bits.ac.in', role: 'RIDER', status: 'VERIFIED', institution: 'BITS Pilani' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const handleToggleVerification = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED' } : u))
    );
    showToast('User verification status updated', 'info');
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div>
          <Badge variant="info">USER MANAGEMENT DIRECTORY</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
            Registered Campus Users
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect platform members, campus email domain credentials, and account roles
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          <Link href="/admin" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Dashboard
          </Link>
          <Link href="/admin/universities" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Universities
          </Link>
          <Link href="/admin/users" className="px-3.5 py-2 bg-[#1e3a8a] text-white rounded-xl shadow-sm">
            Users
          </Link>
          <Link href="/admin/verification" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Verification Queue
          </Link>
          <Link href="/admin/rides" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Ride Monitoring
          </Link>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-cyan-300">Users ({filtered.length})</h2>
            <div className="w-full sm:w-64">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Campus Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{user.name}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="p-3"><Badge variant="info">{user.role}</Badge></td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{user.institution}</td>
                    <td className="p-3">
                      <Badge variant={user.status === 'VERIFIED' ? 'verified' : 'warning'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => handleToggleVerification(user.id)}
                        variant="outline"
                        size="sm"
                      >
                        Toggle Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
