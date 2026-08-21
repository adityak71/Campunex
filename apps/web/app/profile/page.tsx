'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiRequest } from '../../lib/api';
import { User } from '@campunex/shared';
import { User as UserIcon, ShieldCheck, Mail, Building, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a]"></div>
        </div>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-100 pb-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {initials}
            </div>

            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd]">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                Institutional Verification
              </h2>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                {user.verification_status === 'VERIFIED' ? (
                  <span className="text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> VERIFIED
                  </span>
                ) : (
                  <Link
                    href="/verify"
                    className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full hover:underline"
                  >
                    Pending Verification
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Campus Domain:</span>
                <span className="font-mono font-bold text-slate-800">
                  {user.email.split('@')[1] || 'lpu.in'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                Platform Security Badges
              </h2>

              <div className="space-y-1.5 text-xs text-slate-600">
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
                  <span>PostGIS 500m Proximity Shield</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
