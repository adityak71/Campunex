'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { User } from '@campunex/shared';
import {
  Users,
  UserCheck,
  Activity,
  CheckCircle,
  Clock,
  Building,
  Plus,
  Search,
  ShieldCheck,
  Lock,
  ChevronRight,
  Settings,
  FileText
} from 'lucide-react';

const ADMIN_STATS = [
  { label: 'Total Users', value: '12,847', change: '+8.3%', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  { label: 'Verified Users', value: '9,214', change: '+5.1%', icon: UserCheck, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950' },
  { label: 'Active Rides', value: '341', change: '+12.4%', icon: Activity, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
  { label: 'Completed Trips', value: '48,392', change: '+3.7%', icon: CheckCircle, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
  { label: 'Pending Verifications', value: '278', change: '-14.2%', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  { label: 'Universities', value: '47', change: '+2', icon: Building, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
];

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await apiRequest('/auth/me');
        setCurrentUser(res.user);
        if (res.user.role === 'ADMIN') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          showToast('Unauthorized access. Admin privileges required.', 'error');
        }
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 text-center space-y-4">
          <EmptyState
            icon={<Lock className="w-8 h-8 text-rose-500" />}
            title="403 Forbidden — Admin Access Required"
            description="You do not have administrative authorization to view this panel. Only verified platform administrators are allowed."
            action={
              <Link href="/dashboard">
                <Button variant="primary" size="sm">Return to User Dashboard</Button>
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        <div className="space-y-1">
          <Badge variant="info">PLATFORM CONTROL PANEL</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Admin Dashboard & Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real-time platform statistics, university domain permissions, and verification queues
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          <Link href="/admin" className="px-3.5 py-2 bg-[#1e3a8a] text-white rounded-xl shadow-sm">
            Dashboard
          </Link>
          <Link href="/admin/universities" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Universities
          </Link>
          <Link href="/admin/users" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Users
          </Link>
          <Link href="/admin/verification" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Verification Queue
          </Link>
          <Link href="/admin/rides" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Ride Monitoring
          </Link>
          <Link href="/admin/reports" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Reports
          </Link>
          <Link href="/admin/settings" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Settings
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ADMIN_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{stat.change}</span>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{stat.value}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Admin Quick Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="p-6 space-y-3">
            <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">University Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add allowed email domains, enable/disable campus access, and inspect user counts.</p>
            <Link href="/admin/universities" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">Manage Universities</Button>
            </Link>
          </Card>

          <Card hoverable className="p-6 space-y-3">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">User Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inspect registered riders and drivers, verify campus credentials, and manage role permissions.</p>
            <Link href="/admin/users" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">Manage Users</Button>
            </Link>
          </Card>

          <Card hoverable className="p-6 space-y-3">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Live Ride Monitoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitor active campus rides, live WebSocket tracking streams, and dual OTP trip completions.</p>
            <Link href="/admin/rides" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">Monitor Rides</Button>
            </Link>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
