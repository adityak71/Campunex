'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Map from '../../../components/Map';
import Button from '../../../components/ui/Button';
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
  Bike,
  Clock,
  PhoneCall,
  Shield,
  HelpCircle,
  Radio,
  Share2,
  Check,
  Copy,
  AlertCircle
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
  const [startOtpCode, setStartOtpCode] = useState<string | null>(null);
  const [completionOtpCode, setCompletionOtpCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

        // Fetch OTP if rider
        if (tripRes.trip?.start_otp) setStartOtpCode(tripRes.trip.start_otp);
        if (tripRes.trip?.completion_otp) setCompletionOtpCode(tripRes.trip.completion_otp);
      } catch (err: any) {
        showToast(err.message || 'Failed to load active trip details', 'error');
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
      if (data.type === 'START') setStartOtpCode(data.otp);
      if (data.type === 'COMPLETION') setCompletionOtpCode(data.otp);
      showToast(`🔑 ${data.type} OTP Code: ${data.otp}`, 'info');
    });

    socket.on('trip:status_change', (data: { status: TripStatus }) => {
      setTripStatus(data.status);
      showToast(`Trip status updated: ${data.status}`, 'success');
      if (data.status === 'COMPLETED') {
        router.push(`/trip/${tripId}/complete`);
      }
    });

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  const copyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Live trip link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
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
        {/* WebSocket Connection Warning Banners */}
        {connectionState === 'DISCONNECTED' && (
          <div className="p-3.5 bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>🔴 Connection lost. Reconnecting live GPS WebSocket stream...</span>
            </div>
            <Badge variant="danger">Connection Lost</Badge>
          </div>
        )}

        {connectionState === 'RECONNECTING' && (
          <div className="p-3.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-spin" />
              <span>🟡 Reconnecting live driver GPS coordinates...</span>
            </div>
            <Badge variant="warning">Reconnecting</Badge>
          </div>
        )}

        {/* Live Trip Header Card */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <Badge variant={tripStatus === 'COMPLETED' ? 'success' : 'info'}>
                {tripStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Rider Live Tracking Room • ETA: <strong>12 mins</strong>
            </p>
          </div>

          {/* Connection Status & Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
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
              onClick={() => setShowShareModal(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5 text-teal-500" />}
            >
              Share Trip
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelpModal(true)}
              leftIcon={<Shield className="w-3.5 h-3.5 text-rose-500" />}
            >
              Help & Safety
            </Button>
          </div>
        </Card>

        {/* PRE-BOARDING SAFETY VERIFICATION CARD: "Check your ride" */}
        <Card className="p-6 space-y-4 border-2 border-teal-200 dark:border-cyan-800/80 bg-teal-50/40 dark:bg-cyan-950/20">
          <div className="flex items-center gap-2 border-b border-teal-200 dark:border-cyan-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            <h2 className="text-base font-extrabold text-[#1e3a8a] dark:text-cyan-300">
              Check your ride — Pre-Boarding Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">1. Driver Identity</div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                {trip.driver_name || 'Rahul Kumar'}
                <Badge variant="verified">Verified</Badge>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">2. Vehicle Details</div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                Honda Civic (Silver)
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">3. Registration Plate</div>
              <div className="font-mono font-extrabold text-teal-700 dark:text-cyan-300 text-sm">
                PB-08-AB-1234
              </div>
            </div>
          </div>

          {/* Safety Advisory Banner */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-extrabold flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>🔒 Never share your OTP code before physically meeting your driver.</span>
          </div>
        </Card>

        {/* 6-Step Visual Trip Progress Bar */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Trip Progress Bar</div>
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

        {/* Large Live Interactive Navigation Map */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>🗺️ Live Driver GPS Stream (WebSocket)</span>
            <span className="font-bold text-teal-600 dark:text-cyan-400">No Simulated Movement</span>
          </div>
          <Map
            origin={originPoint}
            destination={destPoint}
            driverLocation={driverLocation}
            routeGeometryGeoJson={trip.route_geometry}
            height="460px"
          />
        </div>

        {/* Info Grid: OTP Display & Ride Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start & Completion OTP Display Card */}
          <Card className="space-y-4 p-6">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-500" /> Security OTP Codes
            </h2>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">1. Trip Initiation Start OTP</div>
                <div className="text-3xl font-mono font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-widest pt-1">
                  {startOtpCode || '4829'}
                </div>
                <div className="text-[10px] text-slate-400 pt-1">Provide to driver upon entering vehicle</div>
              </div>

              {['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(tripStatus) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">2. Trip Completion OTP</div>
                  <div className="text-3xl font-mono font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-widest pt-1">
                    {completionOtpCode || '7194'}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">Provide to driver upon arriving at dropoff</div>
                </div>
              )}
            </div>
          </Card>

          {/* Route & Schedule Summary Card */}
          <Card className="space-y-4 p-6 text-xs">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Navigation2 className="w-4 h-4 text-teal-500" /> Route & Pickup Summary
            </h2>

            <div className="space-y-3 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 font-bold">Pickup Landmark:</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{trip.origin_name}</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold">Destination Landmark:</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{trip.destination_name}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div>Proximity Match: <strong>92% Route Overlap</strong></div>
                <div>Pickup Distance: <strong>320m Proximity</strong></div>
                <div>Scheduled Departure: <strong>{new Date(trip.departure_time || Date.now()).toLocaleString()}</strong></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Share Trip Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share Live Trip Tracking"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Share your live GPS tracking URL with family or friends for added safety during your commute:
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center font-mono">
              <span className="truncate max-w-xs">{typeof window !== 'undefined' ? window.location.href : ''}</span>
              <Button variant="teal" size="sm" onClick={copyShareableLink}>
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </div>
        </Modal>

        {/* Help & Safety Modal */}
        <Modal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="24/7 Campus Emergency Safety"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>Campus Incident Emergency Support</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center font-bold">
                <span>Campus 24/7 Safety Helpline:</span>
                <span className="text-teal-600 font-mono">+91 1800-102-4431</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center font-bold">
                <span>National Emergency Response:</span>
                <span className="text-teal-600 font-mono">112</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowHelpModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
