'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Map from '../../../components/Map';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { getSocketClient } from '../../../lib/socket';
import { GeoPoint, TripStatus, User } from '@campunex/shared';
import {
  Navigation2,
  ShieldCheck,
  Lock,
  Play,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Car,
  Clock,
  PhoneCall,
  Shield,
  HelpCircle,
  Radio
} from 'lucide-react';

const TRIP_STEPS: TripStatus[] = [
  'ACCEPTED',
  'OTP_PENDING',
  'STARTED',
  'IN_PROGRESS',
  'COMPLETION_PENDING',
  'COMPLETED',
];

export default function TripLivePage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('ACCEPTED');
  const [driverLocation, setDriverLocation] = useState<GeoPoint | null>(null);
  const [connectionState, setConnectionState] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED');

  const [otpInput, setOtpInput] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const socketRef = useRef<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function initTrip() {
      try {
        const meRes = await apiRequest('/auth/me');
        setCurrentUser(meRes.user);

        const tripRes = await apiRequest(`/trips/${tripId}`);
        setTrip(tripRes.trip);
        setTripStatus(tripRes.trip.status);
      } catch (err: any) {
        showToast(err.message || 'Failed to load active trip', 'error');
      } finally {
        setLoading(false);
      }
    }

    initTrip();
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;

    const socket = getSocketClient();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      setConnectionState('CONNECTED');
      socket.emit('trip:join', { tripId });
    });

    socket.on('disconnect', () => {
      setConnectionState('DISCONNECTED');
      showToast('🔴 WebSocket connection lost. Attempting reconnection...', 'error');
    });

    socket.on('connect_error', () => {
      setConnectionState('RECONNECTING');
    });

    socket.on('trip:location_update', (data: { latitude: number; longitude: number }) => {
      setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    socket.on('trip:otp_generated', (data: { otp: string; type: 'START' | 'COMPLETION' }) => {
      setReceivedOtp(data.otp);
      showToast(`🔑 ${data.type} OTP generated: ${data.otp}`, 'info');
    });

    socket.on('trip:status_change', (data: { status: TripStatus }) => {
      setTripStatus(data.status);
      showToast(`Trip status updated: ${data.status}`, 'success');
    });

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  const isDriver = currentUser?.role === 'DRIVER' || trip?.driver_id === currentUser?.id;

  const handleRequestStartOtp = async () => {
    setOtpError(null);
    try {
      const res = await apiRequest(`/trips/${tripId}/start-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      showToast('Ride initiation OTP sent to Rider!', 'success');
    } catch (err: any) {
      setOtpError(err.message);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleVerifyStartOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpSubmitting(true);
    try {
      const res = await apiRequest(`/trips/${tripId}/verify-start-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: otpInput }),
      });
      setOtpInput('');
      setTripStatus(res.result.status);
      showToast('Start OTP verified! Trip is now IN_PROGRESS.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP code';
      setOtpError(msg);
      showToast(msg, 'error');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleRequestCompletionOtp = async () => {
    setOtpError(null);
    try {
      const res = await apiRequest(`/trips/${tripId}/completion-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      showToast('Completion OTP sent to Rider!', 'success');
    } catch (err: any) {
      setOtpError(err.message);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleVerifyCompletionOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpSubmitting(true);
    try {
      const res = await apiRequest(`/trips/${tripId}/verify-completion-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: otpInput }),
      });
      setOtpInput('');
      setTripStatus(res.result.status);
      showToast('Completion OTP verified! Trip completed successfully.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP code';
      setOtpError(msg);
      showToast(msg, 'error');
    } finally {
      setOtpSubmitting(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-[450px] w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const originPoint = { latitude: parseFloat(trip.origin_lat || '31.2536'), longitude: parseFloat(trip.origin_lng || '75.7037') };
  const destPoint = { latitude: parseFloat(trip.destination_lat || '31.3260'), longitude: parseFloat(trip.destination_lng || '75.5762') };
  const currentStepIdx = TRIP_STEPS.indexOf(tripStatus);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6 w-full">
        {/* Connection Warning Banner */}
        {connectionState === 'DISCONNECTED' && (
          <div className="p-3 bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>🔴 Connection lost. Reconnecting live WebSocket stream...</span>
            </div>
            <Badge variant="danger">Connection Lost</Badge>
          </div>
        )}

        {connectionState === 'RECONNECTING' && (
          <div className="p-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-spin" />
              <span>🟡 Reconnecting live GPS coordinate stream...</span>
            </div>
            <Badge variant="warning">Reconnecting</Badge>
          </div>
        )}

        {/* Live Trip Header Card */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <Badge variant={tripStatus === 'COMPLETED' ? 'success' : 'info'}>
                STATUS: {tripStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distraction-Free Active Trip Interface • Verified Campus Commute
            </p>
          </div>

          {/* Connection Status Pills & Help / Safety Buttons */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                connectionState === 'CONNECTED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : connectionState === 'RECONNECTING'
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              {connectionState === 'CONNECTED' ? (
                <>🟢 Connected</>
              ) : connectionState === 'RECONNECTING' ? (
                <>🟡 Reconnecting</>
              ) : (
                <>🔴 Connection lost</>
              )}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSosModal(true)}
              leftIcon={<Shield className="w-3.5 h-3.5 text-rose-500" />}
            >
              Emergency Safety
            </Button>
          </div>
        </Card>

        {/* 6-Step Visual Trip Progress Bar */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Trip Lifecycle Progress</div>
          <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-bold">
            {TRIP_STEPS.map((step, idx) => (
              <div
                key={step}
                className={`py-1.5 rounded-xl border transition ${
                  idx <= currentStepIdx
                    ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {step.replace('_', ' ')}
              </div>
            ))}
          </div>
        </Card>

        {/* Large Interactive Navigation Map */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>🗺️ Distraction-Free Driver Live Navigation Map</span>
            <span className="font-bold text-teal-600 dark:text-cyan-400">Real-Time Coordinate Stream</span>
          </div>
          <Map
            origin={originPoint}
            destination={destPoint}
            driverLocation={driverLocation}
            routeGeometryGeoJson={trip.route_geometry}
            height="480px"
          />
        </div>

        {/* Info Cards Grid (Rider & Vehicle Details + Dual OTP Controls) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rider Information Card */}
          <Card className="space-y-3 p-5 text-xs">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Rider Information
            </h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{trip.rider_name}</span>
                <Badge variant="verified">
                  <ShieldCheck className="w-3 h-3 text-teal-600" /> .edu Verified
                </Badge>
              </div>
              <div className="text-slate-500 dark:text-slate-400">{trip.rider_email}</div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">Pickup Landmark:</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{trip.origin_name}</div>
              </div>
            </div>
          </Card>

          {/* Vehicle Information Card */}
          <Card className="space-y-3 p-5 text-xs">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Driver Vehicle Details
            </h2>

            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div>Driver: <strong>{trip.driver_name}</strong></div>
              <div>Vehicle: <strong>Campus Commute Vehicle</strong></div>
              <div>Verification: <strong>Institutional Verified</strong></div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">Destination Landmark:</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{trip.destination_name}</div>
              </div>
            </div>
          </Card>

          {/* Dual OTP & Safety Controls Box */}
          <Card className="space-y-4 p-5">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>🔐 Dual OTP Security Controls</span>
              <span className="text-[10px] text-slate-400">4-Digit Redis</span>
            </h2>

            {otpError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {otpError}
              </div>
            )}

            {/* Rider View Code Badge */}
            {!isDriver && (
              <div className="space-y-2 text-xs">
                <span className="text-slate-500">Rider Security Code:</span>
                {receivedOtp ? (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
                    <div className="text-2xl font-mono font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-widest">{receivedOtp}</div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-2">Waiting for driver OTP request...</div>
                )}
              </div>
            )}

            {/* Driver Controls */}
            {isDriver && (
              <div className="space-y-3 text-xs">
                {['ACCEPTED', 'OTP_PENDING'].includes(tripStatus) && (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">1. Initiation OTP</span>
                      <Button onClick={handleRequestStartOtp} variant="primary" size="sm">
                        Request OTP
                      </Button>
                    </div>

                    <form onSubmit={handleVerifyStartOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit code"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <Button type="submit" variant="teal" size="sm" isLoading={otpSubmitting} disabled={otpInput.length !== 4}>
                        Verify & Start
                      </Button>
                    </form>
                  </div>
                )}

                {['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(tripStatus) && (
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">2. Completion OTP</span>
                      <Button onClick={handleRequestCompletionOtp} variant="primary" size="sm">
                        Request OTP
                      </Button>
                    </div>

                    <form onSubmit={handleVerifyCompletionOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit code"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <Button type="submit" variant="teal" size="sm" isLoading={otpSubmitting} disabled={otpInput.length !== 4}>
                        Verify & Complete
                      </Button>
                    </form>
                  </div>
                )}

                {tripStatus === 'COMPLETED' && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-bold text-center">
                    🎉 Trip Completed Successfully!
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Emergency Safety SOS Modal */}
        <Modal
          isOpen={showSosModal}
          onClose={() => setShowSosModal(false)}
          title="Emergency Safety & Campus Support"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Campus Security & Emergency Helpline</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              If you feel unsafe or experience a vehicle emergency during your commute, contact campus security immediately.
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center font-bold">
                <span>Campus Emergency Security:</span>
                <span className="text-teal-600 font-mono">+91 1800-102-4431</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center font-bold">
                <span>National Emergency Services:</span>
                <span className="text-teal-600 font-mono">112</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowSosModal(false)}
            >
              Close Emergency Dialog
            </Button>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
