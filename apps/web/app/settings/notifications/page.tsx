'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import {
  Bell,
  Lock,
  ShieldCheck,
  Mail,
  Smartphone,
  Car,
  Navigation2,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export default function NotificationPreferencesPage() {
  const [roleTab, setRoleTab] = useState<'RIDER' | 'DRIVER'>('RIDER');

  // Rider Preferences
  const [rRideInApp, setRRideInApp] = useState(true);
  const [rRideEmail, setRRideEmail] = useState(true);
  const [rRidePush, setRRidePush] = useState(true);

  const [rTripInApp, setRTripInApp] = useState(true);
  const [rTripEmail, setRTripEmail] = useState(true);
  const [rTripPush, setRTripPush] = useState(true);

  // Driver Preferences
  const [dReqInApp, setDReqInApp] = useState(true);
  const [dReqEmail, setDReqEmail] = useState(true);
  const [dReqPush, setDReqPush] = useState(true);

  const [dTripInApp, setDTripInApp] = useState(true);
  const [dTripEmail, setDTripEmail] = useState(true);
  const [dTripPush, setDTripPush] = useState(true);

  const { showToast } = useToast();

  const handleSavePreferences = () => {
    showToast('Notification preference channels saved successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="space-y-1">
          <Badge variant="info">NOTIFICATION PREFERENCES</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
            Notification Settings & Channels
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control delivery channels for ride matches, seat requests, and trip updates
          </p>
        </div>

        {/* Role Preference Tabs */}
        <Card className="p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRoleTab('RIDER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                roleTab === 'RIDER'
                  ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              👤 Rider Notification Channels
            </button>
            <button
              type="button"
              onClick={() => setRoleTab('DRIVER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                roleTab === 'DRIVER'
                  ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              🚗 Driver Notification Channels
            </button>
          </div>
        </Card>

        {/* Preferences Form Card */}
        <Card className="p-6 md:p-8 space-y-8">
          {/* RIDER CHANNELS */}
          {roleTab === 'RIDER' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h2 className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-teal-500" /> Ride Matching & Search Alerts
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={rRideInApp}
                      onChange={(e) => setRRideInApp(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={rRideEmail}
                      onChange={(e) => setRRideEmail(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={rRidePush}
                      onChange={(e) => setRRidePush(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h2 className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-teal-500" /> Active Trip & Driver Proximity Updates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={rTripInApp}
                      onChange={(e) => setRTripInApp(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={rTripEmail}
                      onChange={(e) => setRTripEmail(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={rTripPush}
                      onChange={(e) => setRTripPush(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* DRIVER CHANNELS */}
          {roleTab === 'DRIVER' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h2 className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-500" /> Rider Requests & Booking Updates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={dReqInApp}
                      onChange={(e) => setDReqInApp(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={dReqEmail}
                      onChange={(e) => setDReqEmail(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={dReqPush}
                      onChange={(e) => setDReqPush(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h2 className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-teal-500" /> Active Trip & OTP Verification
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={dTripInApp}
                      onChange={(e) => setDTripInApp(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={dTripEmail}
                      onChange={(e) => setDTripEmail(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={dTripPush}
                      onChange={(e) => setDTripPush(e.target.checked)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* MANDATORY LOCKED SAFETY & SECURITY SECTION */}
          <div className="p-4 bg-teal-50/60 dark:bg-cyan-950/40 border border-teal-200 dark:border-cyan-800 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <div className="font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Mandatory Safety & Critical Security Alerts
              </div>
              <Badge variant="verified">Always Enabled</Badge>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Safety advisories, active trip emergency alerts, account security warnings, and OTP verification notices remain permanently enabled and cannot be disabled to protect campus member safety.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-semibold text-[11px] text-teal-800 dark:text-teal-300">
              <div>✓ Safety Advisories</div>
              <div>✓ OTP Security Alerts</div>
              <div>✓ Account Suspensions</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
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
