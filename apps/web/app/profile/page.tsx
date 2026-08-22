'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { User } from '@campunex/shared';
import { User as UserIcon, ShieldCheck, Mail, Building, CheckCircle2, LogOut, Lock, Bell, Eye } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.user);
      } catch (err: any) {
        showToast(err.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    showToast('Logged out successfully', 'info');
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
        {/* Profile Card */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {initials}
            </div>

            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h1>
                <Badge variant="info">{user.role}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institution Verification Section */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
                Institutional Verification
              </h2>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                {user.verification_status === 'VERIFIED' ? (
                  <Badge variant="verified">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> VERIFIED
                  </Badge>
                ) : (
                  <Link href="/verify">
                    <Badge variant="warning">Pending Verification</Badge>
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Campus Domain:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {user.email.split('@')[1] || 'lpu.in'}
                </span>
              </div>
            </div>

            {/* Platform Badges Section */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
                Platform Security Badges
              </h2>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Argon2id Hashed Passwords</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Dual 4-Digit OTP Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>500m Route Proximity Shield</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out of Account
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
