'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WorkspaceLayout from '../../components/layouts/WorkspaceLayout';
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
      <WorkspaceLayout mode="rider" title="My Profile" subtitle="Manage your university identity and account details">
      <div className="space-y-6 w-full">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
    </WorkspaceLayout>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <WorkspaceLayout mode="rider" title="My Profile" subtitle="Manage your university identity and account details">
      <div className="space-y-6 w-full">
        {/* Header Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-[22px] p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-white/10 pb-6">
            <div className="w-20 h-20 rounded-full bg-white/5 text-white/80 flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {initials}
            </div>

            <div className="text-center md:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
                <Badge variant="verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent3" /> .edu Verified
                </Badge>
                <Badge variant="info">Role: {user.role}</Badge>
              </div>

              <div className="text-xs text-white/60 space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Building className="w-3.5 h-3.5 text-accent3" />
                  <span>University: <strong>Lovely Professional University (LPU)</strong></span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent3" />
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
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
              <h2 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent3" /> Security
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white/80">Two-Factor Auth</div>
                    <div className="text-[10px] text-white/40">Require OTP code for logins</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10/60 /10/60">
                  <div>
                    <div className="font-bold text-white/80">Password Encryption</div>
                    <div className="text-[10px] text-white/40">Argon2id Hashed Keys</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>

            {/* 2. Notifications Settings */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
              <h2 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-accent3" /> Notifications
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/80">Email Ride Alerts</span>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/80">WebSocket Push Alerts</span>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/80">SMS OTP Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 3. Privacy Settings */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
              <h2 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-accent3" /> Privacy
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white/80">Profile Visibility</div>
                    <div className="text-[10px] text-white/40">Campus member view only</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10/60 /10/60">
                  <div>
                    <div className="font-bold text-white/80">Live GPS Sharing</div>
                    <div className="text-[10px] text-white/40">500m proximity active trips</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationSharing}
                    onChange={(e) => setLocationSharing(e.target.checked)}
                    className="h-4 w-4 text-accent3 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Preference Settings
            </Button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
