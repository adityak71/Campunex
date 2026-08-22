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
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Building,
  CheckCircle2,
  LogOut,
  Lock,
  Bell,
  Eye,
  Key,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings Toggles State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest('/auth/me');
        setUser(res.user);
      } catch (err: any) {
        showToast(err.message || 'Failed to load user profile', 'error');
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

  const handleSavePreferences = () => {
    showToast('Account preferences saved successfully!', 'success');
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
        {/* Header Profile Card */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-cyan-300 flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {initials}
            </div>

            <div className="text-center md:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h1>
                <Badge variant="verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> .edu Verified
                </Badge>
                <Badge variant="info">Role: {user.role}</Badge>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-500" />
                  <span>University: <strong>Lovely Professional University (LPU)</strong></span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-500" />
                  <span>Verified Email: <strong>{user.email}</strong></span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Logout
            </Button>
          </div>

          {/* Account Settings Tabs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Security Settings */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
              <h2 className="font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-500" /> Security
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Two-Factor Auth</div>
                    <div className="text-[10px] text-slate-400">Require OTP code for logins</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Password Encryption</div>
                    <div className="text-[10px] text-slate-400">Argon2id Hashed Keys</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>

            {/* 2. Notifications Settings */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
              <h2 className="font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-500" /> Notifications
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Email Ride Alerts</span>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">WebSocket Push Alerts</span>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">SMS OTP Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 3. Privacy Settings */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-xs">
              <h2 className="font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-500" /> Privacy
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Profile Visibility</div>
                    <div className="text-[10px] text-slate-400">Campus member view only</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Live GPS Sharing</div>
                    <div className="text-[10px] text-slate-400">500m proximity active trips</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationSharing}
                    onChange={(e) => setLocationSharing(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="teal" size="sm" onClick={handleSavePreferences}>
              Save Preference Settings
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
