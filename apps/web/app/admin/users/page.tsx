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
import Modal from '../../../components/ui/Modal';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Car,
  CreditCard,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUserForReview, setSelectedUserForReview] = useState<any | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admin/users');
      setUsers(res.users || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load platform users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenReviewModal = (user: any) => {
    setSelectedUserForReview(user);
    setRejectionReason(user.rejection_reason || '');
  };

  const handleCloseReviewModal = () => {
    setSelectedUserForReview(null);
    setRejectionReason('');
  };

  const handleApproveDriver = async (userId: string) => {
    try {
      setReviewLoading(true);
      await apiRequest(`/admin/drivers/${userId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ approval_status: 'APPROVED' }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                verification_status: 'VERIFIED',
                approval_status: 'APPROVED',
                rejection_reason: null,
              }
            : u
        )
      );

      showToast('Driver successfully verified and approved!', 'success');
      handleCloseReviewModal();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve driver', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRejectDriver = async (userId: string) => {
    try {
      setReviewLoading(true);
      const reason = rejectionReason.trim() || 'Driver documents do not meet verification criteria';
      await apiRequest(`/admin/drivers/${userId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({
          approval_status: 'REJECTED',
          rejection_reason: reason,
        }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                verification_status: 'REJECTED',
                approval_status: 'REJECTED',
                rejection_reason: reason,
              }
            : u
        )
      );

      showToast('Driver application rejected', 'info');
      handleCloseReviewModal();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject driver', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleToggleVerification = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    try {
      await apiRequest(`/admin/users/${id}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ verification_status: nextStatus }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, verification_status: nextStatus, status: nextStatus } : u
        )
      );
      showToast(`User verification set to ${nextStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification status', 'error');
    }
  };

  const handleToggleBlock = async (id: string, currentlyBlocked: boolean) => {
    const nextBlocked = !currentlyBlocked;
    try {
      await apiRequest(`/admin/users/${id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ is_blocked: nextBlocked }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_blocked: nextBlocked } : u))
      );
      showToast(`User successfully ${nextBlocked ? 'blocked' : 'unblocked'}`, nextBlocked ? 'error' : 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user block status', 'error');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
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
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent1 animate-ping"></span>
                        Loading verified directory...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No matching campus members found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const status = user.verification_status || user.status || 'PENDING';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{user.name}</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="p-3"><Badge variant="info">{user.role}</Badge></td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{user.institution || '—'}</td>
                        <td className="p-3">
                          {user.is_blocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={status === 'VERIFIED' ? 'verified' : 'warning'}>
                              {status}
                            </Badge>
                            {user.role === 'DRIVER' && user.driver_profile_id && (
                              <button
                                onClick={() => handleOpenReviewModal(user)}
                                title="View submitted KYC documents"
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-0.5 ml-1 transition"
                              >
                                <Eye className="w-3 h-3" />
                                Docs
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status === 'VERIFIED' ? (
                              <Button
                                onClick={() => handleToggleVerification(user.id, status)}
                                variant="outline"
                                size="sm"
                                className="text-xs text-slate-600 dark:text-slate-300 hover:text-rose-400"
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleOpenReviewModal(user)}
                                variant="outline"
                                size="sm"
                                className="text-xs font-bold border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10"
                              >
                                Verify
                              </Button>
                            )}

                            <Button
                              onClick={() => handleToggleBlock(user.id, !!user.is_blocked)}
                              variant="outline"
                              size="sm"
                              className={`text-xs ${
                                user.is_blocked
                                  ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                                  : 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                              }`}
                            >
                              {user.is_blocked ? 'Unblock' : 'Block'}
                            </Button>
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

      {/* Driver Verification Details Modal Popup */}
      {selectedUserForReview && (
        <Modal
          isOpen={!!selectedUserForReview}
          onClose={handleCloseReviewModal}
          title="Driver Verification & Document Review"
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
            {/* Header Summary */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUserForReview.name}
                </h4>
                <div className="font-mono text-slate-500 text-xs">
                  {selectedUserForReview.email}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {selectedUserForReview.institution || 'Campus Member'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{selectedUserForReview.role}</Badge>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  selectedUserForReview.verification_status === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : selectedUserForReview.verification_status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedUserForReview.verification_status || 'PENDING'}
                </span>
              </div>
            </div>

            {selectedUserForReview.driver_profile_id ? (
              <div className="space-y-4">
                {/* Section 1: Driver Identification */}
                <div className="space-y-2">
                  <div className="font-bold text-indigo-500 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    1. Government Identification & Contact
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mobile Number</span>
                      <div className="font-mono font-bold flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUserForReview.phone_number || '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
                      <div className="font-medium flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUserForReview.dob ? new Date(selectedUserForReview.dob).toLocaleDateString() : '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Aadhaar Card (12 Digits)</span>
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 text-sm">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedUserForReview.aadhaar_number || '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Driving License (DL) Number</span>
                      <div className="font-mono font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-sm">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        {selectedUserForReview.driving_license_number || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Vehicle Details */}
                <div className="space-y-2 pt-1">
                  <div className="font-bold text-indigo-500 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    2. Vehicle Specifications & Registration
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle License Plate</span>
                      <div className="font-mono font-black tracking-wider text-slate-900 dark:text-cyan-300 flex items-center gap-1.5 text-sm uppercase">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUserForReview.vehicle_number || '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Registration Certificate (RC)</span>
                      <div className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm uppercase">
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        {selectedUserForReview.rc_number || '—'}
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Make & Model</span>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {selectedUserForReview.vehicle_make} {selectedUserForReview.vehicle_model}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Color</span>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {selectedUserForReview.vehicle_color || 'White'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Note input (only shown when pending/unverified) */}
                {selectedUserForReview.verification_status !== 'VERIFIED' && (
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Rejection / Verification Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Invalid Aadhaar, unreadable Driving License, plate mismatch..."
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent1"
                    />
                  </div>
                )}

                {/* Decision Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    onClick={handleCloseReviewModal}
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>

                  {selectedUserForReview.verification_status === 'VERIFIED' ? (
                    <Button
                      onClick={async () => {
                        await handleToggleVerification(selectedUserForReview.id, 'VERIFIED');
                        handleCloseReviewModal();
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto border-rose-500/40 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 font-bold"
                    >
                      <XCircle className="w-4 h-4" />
                      Revoke Verification
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleRejectDriver(selectedUserForReview.id)}
                        variant="outline"
                        size="sm"
                        isLoading={reviewLoading}
                        className="w-full sm:w-auto border-rose-500/40 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 font-bold"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Application
                      </Button>

                      <Button
                        onClick={() => handleApproveDriver(selectedUserForReview.id)}
                        variant="primary"
                        size="sm"
                        isLoading={reviewLoading}
                        className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Verify Driver
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Not Uploaded Any Docs
                  </h5>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    This user (<span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedUserForReview.email}</span>) has not uploaded or submitted any verification documents or ID proof yet.
                  </p>
                </div>

                {/* Account Details Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left max-w-md mx-auto space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Registration Information
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Campus Member</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedUserForReview.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Institution</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{selectedUserForReview.institution || 'Campus Member'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Account Role</span>
                      <span className="font-bold text-indigo-500">{selectedUserForReview.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Status</span>
                      <span className="font-bold text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Not Uploaded
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button onClick={handleCloseReviewModal} variant="ghost" size="sm" className="w-full sm:w-auto">
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleToggleVerification(selectedUserForReview.id, selectedUserForReview.verification_status);
                      handleCloseReviewModal();
                    }}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto !bg-amber-600 hover:!bg-amber-700 !text-white font-bold"
                  >
                    Force Verify Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
