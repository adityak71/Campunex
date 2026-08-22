'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { User } from '@campunex/shared';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Car,
  Lock,
  Bell,
  Eye,
  LogOut,
  CheckCircle2,
  Sliders,
  Smartphone
} from 'lucide-react';

export default function DriverProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.user);
      } catch (err: any) {
        showToast(err.message || 'Failed to load driver profile', 'error');
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div className="space-y-1">
          <Badge variant="info">DRIVER ACCOUNT & PREFERENCES</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Driver Profile Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your verified institutional identity, vehicle registration, notifications, and security controls
          </p>
        </div>

        {/* Header Profile Summary */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-2xl shadow-sm border-2 border-teal-500">
              {initials}
            </div>

            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h2>
                <Badge variant="verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> .edu Verified Driver
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Details */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-teal-500" /> Registered Vehicle
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Vehicle Make & Model:</span>
                  <strong className="text-slate-900 dark:text-slate-100">Honda Civic (Silver)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Registration Number:</span>
                  <strong className="font-mono text-slate-900 dark:text-slate-100">PB-08-AB-1234</strong>
                </div>
                <div className="flex justify-between">
                  <span>Passenger Seat Capacity:</span>
                  <strong className="text-teal-600 dark:text-teal-400">4 Seats</strong>
                </div>
              </div>
            </div>

            {/* Institutional Verification */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-500" /> Campus Credentials
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>University Domain:</span>
                  <strong className="font-mono text-slate-900 dark:text-slate-100">{user.email.split('@')[1] || 'lpu.in'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Institutional Status:</span>
                  <strong className="text-teal-600 font-bold">Active Campus Member</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-500" /> Notification Preferences
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Email Ride Requests</span>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-500" /> Privacy & Location Controls
              </h3>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Live GPS Stream Sharing</span>
                <input
                  type="checkbox"
                  checked={locationSharing}
                  onChange={(e) => setLocationSharing(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded"
                />
              </label>
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
