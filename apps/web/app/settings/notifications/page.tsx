'use client';

import React, { useState } from 'react';
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
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
    <WorkspaceLayout mode="rider" title="Notification Settings" subtitle="Manage your email and push alert preferences">
      <div className="space-y-6 w-full">
        {/* Header */}
        

        {/* Role Preference Tabs */}
        <div className="bg-white/5 border border-white/10 rounded-[22px] p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRoleTab('RIDER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                roleTab === 'RIDER'
                  ? 'bg-white/5 text-white/80 border-white/10 shadow-sm'
                  : 'bg-white/5 text-white/60 border-white/10'
              }`}
            >
              👤 Rider Notification Channels
            </button>
            <button
              type="button"
              onClick={() => setRoleTab('DRIVER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                roleTab === 'DRIVER'
                  ? 'bg-white/5 text-white/80 border-white/10 shadow-sm'
                  : 'bg-white/5 text-white/60 border-white/10'
              }`}
            >
              🚗 Driver Notification Channels
            </button>
          </div>
        </div>

        {/* Preferences Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-[22px] p-6 md:p-8 space-y-8">
          {/* RIDER CHANNELS */}
          {roleTab === 'RIDER' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-accent3" /> Ride Matching & Search Alerts
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={rRideInApp}
                      onChange={(e) => setRRideInApp(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={rRideEmail}
                      onChange={(e) => setRRideEmail(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={rRidePush}
                      onChange={(e) => setRRidePush(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-b border-white/10 pb-6">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-accent3" /> Active Trip & Driver Proximity Updates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={rTripInApp}
                      onChange={(e) => setRTripInApp(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={rTripEmail}
                      onChange={(e) => setRTripEmail(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={rTripPush}
                      onChange={(e) => setRTripPush(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* DRIVER CHANNELS */}
          {roleTab === 'DRIVER' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-4 border-b border-white/10 pb-6">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-accent3" /> Rider Requests & Booking Updates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={dReqInApp}
                      onChange={(e) => setDReqInApp(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={dReqEmail}
                      onChange={(e) => setDReqEmail(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={dReqPush}
                      onChange={(e) => setDReqPush(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-b border-white/10 pb-6">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-accent3" /> Active Trip & OTP Verification
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">In-App Banner</span>
                    <input
                      type="checkbox"
                      checked={dTripInApp}
                      onChange={(e) => setDTripInApp(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Email Digest</span>
                    <input
                      type="checkbox"
                      checked={dTripEmail}
                      onChange={(e) => setDTripEmail(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="font-bold text-white/80">Mobile Push</span>
                    <input
                      type="checkbox"
                      checked={dTripPush}
                      onChange={(e) => setDTripPush(e.target.checked)}
                      className="h-4 w-4 text-accent3 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* MANDATORY LOCKED SAFETY & SECURITY SECTION */}
          <div className="p-4 bg-white/5/60 /5/40 border border-white/10 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <div className="font-extrabold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent3 " /> Mandatory Safety & Critical Security Alerts
              </div>
              <Badge variant="verified">Always Enabled</Badge>
            </div>

            <p className="text-white/60 text-[11px]">
              Safety advisories, active trip emergency alerts, account security warnings, and OTP verification notices remain permanently enabled and cannot be disabled to protect campus member safety.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-semibold text-[11px] text-white/80">
              <div>✓ Safety Advisories</div>
              <div>✓ OTP Security Alerts</div>
              <div>✓ Account Suspensions</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Preference Settings
            </Button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
