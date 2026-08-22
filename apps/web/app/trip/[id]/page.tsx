'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Clock
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
  const [simulating, setSimulating] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

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
        showToast(err.message || 'Failed to load trip', 'error');
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
      showToast('WebSocket connection interrupted. Reconnecting...', 'error');
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

  const handleStartDevSimulation = async () => {
    setSimulating(true);
    try {
      await apiRequest(`/dev/trips/${tripId}/simulate-location`, { method: 'POST' });
      showToast('📡 Dev GPS Simulator active: Driver moving along route waypoints...', 'info');
    } catch (err: any) {
      showToast(`Simulation Error: ${err.message}`, 'error');
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
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
        {connectionState !== 'CONNECTED' && (
          <div className="p-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-between shadow">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>Connection interrupted. Reconnecting live WebSocket stream...</span>
            </div>
            <Badge variant="warning">Reconnecting</Badge>
          </div>
        )}

        {/* Live Trip Header Card */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <Badge variant={tripStatus === 'COMPLETED' ? 'success' : 'info'}>
                STATUS: {tripStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Driver: <strong>{trip.driver_name}</strong> | Rider: <strong>{trip.rider_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                connectionState === 'CONNECTED'
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
              }`}
            >
              {connectionState === 'CONNECTED' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>WebSocket: {connectionState}</span>
            </span>

            <Button
              onClick={handleStartDevSimulation}
              isLoading={simulating}
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5 text-teal-300" />}
            >
              Dev GPS Simulator
            </Button>
          </div>
        </Card>

        {/* Visual Trip State Progress Bar */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Trip Progress Flow</div>
          <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-bold">
            {TRIP_STEPS.map((step, idx) => (
              <div
                key={step}
                className={`py-1.5 rounded-lg border transition ${
                  idx <= currentStepIdx
                    ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {step.replace('_', ' ')}
              </div>
            ))}
          </div>
        </Card>

        {/* Map Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>🗺️ Live Driver GPS Location Tracking (Socket.IO + Redis Cache)</span>
            <span className="font-bold text-teal-600 dark:text-cyan-400">Real-Time Coordinate Stream</span>
          </div>
          <Map
            origin={originPoint}
            destination={destPoint}
            driverLocation={driverLocation}
            routeGeometryGeoJson={trip.route_geometry}
            height="450px"
          />
        </div>

        {/* Dual OTP & Control Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OTP Security Box */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Dual OTP Ride Verification Security
              </h2>
              <span className="text-[10px] text-slate-400">4-Digit Redis Hash</span>
            </div>

            {/* Warning Banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Never share your OTP before physically meeting your driver.</span>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {otpError}
              </div>
            )}

            {/* Rider View */}
            {!isDriver && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Rider Security Code Badge:</div>
                {receivedOtp ? (
                  <div className="text-center p-4 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1 shadow-sm">
                    <div className="text-xs text-teal-700 dark:text-teal-300 font-semibold">Share this code with your Driver:</div>
                    <div className="text-3xl font-mono font-extrabold tracking-widest text-[#1e3a8a] dark:text-cyan-300">
                      {receivedOtp}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">
                    Waiting for driver to initiate Start or Completion OTP verification...
                  </div>
                )}
              </div>
            )}

            {/* Driver Controls */}
            {isDriver && (
              <div className="space-y-4">
                {['ACCEPTED', 'OTP_PENDING'].includes(tripStatus) && (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Initiation OTP Verification</span>
                      <Button
                        onClick={handleRequestStartOtp}
                        variant="primary"
                        size="sm"
                      >
                        Request Rider OTP
                      </Button>
                    </div>

                    <form onSubmit={handleVerifyStartOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit OTP"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <Button
                        type="submit"
                        variant="teal"
                        size="sm"
                        isLoading={otpSubmitting}
                        disabled={otpInput.length !== 4}
                      >
                        Verify & Start
                      </Button>
                    </form>
                  </div>
                )}

                {['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(tripStatus) && (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Completion OTP Verification</span>
                      <Button
                        onClick={handleRequestCompletionOtp}
                        variant="primary"
                        size="sm"
                      >
                        Request Rider OTP
                      </Button>
                    </div>

                    <form onSubmit={handleVerifyCompletionOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit OTP"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <Button
                        type="submit"
                        variant="teal"
                        size="sm"
                        isLoading={otpSubmitting}
                        disabled={otpInput.length !== 4}
                      >
                        Verify & Complete
                      </Button>
                    </form>
                  </div>
                )}

                {tripStatus === 'COMPLETED' && (
                  <div className="p-4 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-bold text-center">
                    🎉 Trip Completed Successfully! Record permanently saved in PostgreSQL.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Trip Summary Box */}
          <Card className="space-y-4 text-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
                📋 Trip Summary Details
              </h2>
            </div>

            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Trip ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{trip.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Driver Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{trip.driver_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Rider Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{trip.rider_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Departure Location:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{trip.origin_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Destination Location:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{trip.destination_name}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
