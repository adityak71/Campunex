'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import {
  Car,
  Search,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Phone,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function AdminVerificationPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadPendingDrivers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admin/drivers/pending');
      setProfiles(res.driverProfiles || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load driver verification queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingDrivers();
  }, []);

  const handleUpdateApproval = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoadingId(id);
      await apiRequest(`/admin/drivers/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status: newStatus }),
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, approval_status: newStatus } : p))
      );
      showToast(
        `Driver ${newStatus === 'APPROVED' ? 'Approved & Verified' : 'Rejected'} successfully!`,
        newStatus === 'APPROVED' ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update driver approval status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = profiles.filter(
    (p) =>
      p.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.driver_email?.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.aadhaar_number?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = profiles.filter((p) => p.approval_status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Badge variant="info">CAMPUS SAFETY OVERSIGHT</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              Driver KYC Verification Queue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect government identification (Aadhaar), driver date of birth, and authorized campus vehicle plates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-500">
              {pendingCount} Pending Review
            </span>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          <Link href="/admin" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Dashboard
          </Link>
          <Link href="/admin/universities" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Universities
          </Link>
          <Link href="/admin/users" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Users
          </Link>
          <Link href="/admin/verification" className="px-3.5 py-2 bg-[#1e3a8a] text-white rounded-xl shadow-sm">
            Verification Queue
          </Link>
          <Link href="/admin/rides" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Ride Monitoring
          </Link>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-cyan-300">
              Submitted Driver Applications ({filtered.length})
            </h2>
            <div className="w-full sm:w-72">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search driver, email, or vehicle plate..."
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Driver Details</th>
                  <th className="p-3">Contact & DOB</th>
                  <th className="p-3">Govt ID & License</th>
                  <th className="p-3">Vehicle & RC Specs</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent1 animate-ping"></span>
                        Loading driver applications...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No driver verification submissions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((profile) => {
                    const status = profile.approval_status || 'PENDING';
                    const isProcessing = actionLoadingId === profile.id;
                    const formattedDob = profile.dob ? new Date(profile.dob).toLocaleDateString() : '—';

                    return (
                      <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {profile.driver_name}
                          </div>
                          <div className="font-mono text-slate-500 text-[11px]">
                            {profile.driver_email}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {profile.institution_name || 'Campus Member'}
                          </div>
                        </td>

                        <td className="p-3 space-y-0.5">
                          <div className="font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {profile.phone_number || '—'}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            DOB: {formattedDob}
                          </div>
                        </td>

                        <td className="p-3 space-y-1">
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 w-fit text-[11px]">
                            <CreditCard className="w-3.5 h-3.5" />
                            UID: {profile.aadhaar_number}
                          </div>
                          {profile.driving_license_number && (
                            <div className="font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800/60 w-fit text-[11px]">
                              <FileText className="w-3.5 h-3.5" />
                              DL: {profile.driving_license_number}
                            </div>
                          )}
                        </td>

                        <td className="p-3 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 dark:text-cyan-300 uppercase tracking-wider text-xs">
                              {profile.vehicle_number}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              profile.vehicle_type === 'BIKE'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {profile.vehicle_type === 'BIKE' ? '🏍️ BIKE' : '🚗 CAR'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {profile.vehicle_make} {profile.vehicle_model} ({profile.vehicle_color})
                          </div>
                          {profile.rc_number && (
                            <div className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 w-fit">
                              RC: {profile.rc_number}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {status === 'APPROVED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" /> APPROVED
                            </span>
                          ) : status === 'REJECTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> REJECTED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 animate-pulse" /> PENDING (24-48h)
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status !== 'APPROVED' && (
                              <Button
                                onClick={() => handleUpdateApproval(profile.id, 'APPROVED')}
                                variant="primary"
                                size="sm"
                                isLoading={isProcessing}
                                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white text-xs"
                              >
                                Approve Driver
                              </Button>
                            )}

                            {status !== 'REJECTED' && (
                              <Button
                                onClick={() => handleUpdateApproval(profile.id, 'REJECTED')}
                                variant="outline"
                                size="sm"
                                isLoading={isProcessing}
                                className="border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
