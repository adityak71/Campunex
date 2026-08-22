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
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { getSocketClient } from '../../../lib/socket';
import { formatDepartureTime } from '../../../lib/formatters';
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
  AlertCircle,
  UserCheck,
  MapPin,
  XCircle
} from 'lucide-react';

const TRIP_STEPS: TripStatus[] = [
  'ACCEPTED',
  'STARTED',
  'IN_PROGRESS',
  'COMPLETION_PENDING',
  'COMPLETED',
];

interface AcceptedRider {
  id: string;
  name: string;
  seatNumber: number;
  verified: boolean;
  otpVerified: boolean;
  pickupName: string;
  otpInput?: string;
  status: 'PENDING' | 'VERIFIED' | 'DELAYED' | 'NO_SHOW';
}

export default function TripLivePage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('ACCEPTED');
  const [driverLocation, setDriverLocation] = useState<GeoPoint | null>(null);
  const [connectionState, setConnectionState] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED');

  const [startOtpCode, setStartOtpCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // No-Show Modal State
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [riderForNoShow, setRiderForNoShow] = useState<string | null>(null);

  // Accepted Riders List for Driver View - fetched from backend
  const [acceptedRiders, setAcceptedRiders] = useState<AcceptedRider[]>([]);

  const socketRef = useRef<any>(null);
  const { showToast } = useToast();

  const isDriver = currentUser?.role === 'DRIVER';
  const isCompleted = tripStatus === 'COMPLETED';

  useEffect(() => {
    async function initTrip() {
      try {
        const meRes = await apiRequest('/auth/me');
        setCurrentUser(meRes.user);

        const tripRes = await apiRequest(`/trips/${tripId}`);
        const tripData = tripRes.trip;
        setTrip(tripData);
        setTripStatus(tripData.status);

        // Fetch accepted riders for driver view
        if (meRes.user?.role === 'DRIVER' && tripData?.ride_id) {
          try {
            const reqRes = await apiRequest(`/rides/${tripData.ride_id}/requests`);
            const accepted = (reqRes.requests || []).filter((r: any) => r.status === 'ACCEPTED');
            setAcceptedRiders(
              accepted.map((r: any, idx: number) => ({
                id: r.id,
                name: r.rider_name || 'Rider',
                seatNumber: idx + 1,
                verified: true,
                otpVerified: false,
                pickupName: r.origin_lat ? `${r.origin_lat}, ${r.origin_lng}` : 'Pickup Point',
                status: 'PENDING' as const,
                otpInput: '',
              }))
            );
          } catch {
            // Non-critical: leave empty
          }
        }
      } catch (err: any) {
        // Trip fetch failed - show minimal fallback
        setTrip(null);
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
    });

    socket.on('connect_error', () => {
      setConnectionState('RECONNECTING');
    });

    socket.on('trip:location_update', (data: { latitude: number; longitude: number }) => {
      setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    socket.on('trip:status_change', (data: { status: TripStatus }) => {
      setTripStatus(data.status);
      showToast(`Trip status updated: ${data.status}`, 'success');
      if (data.status === 'COMPLETED') {
        router.push(`/trip/${tripId}/complete`);
      }
    });

    socket.on('trip:otp_generated', (data: { tripId: string; type: string; otp: string }) => {
      if (data.tripId === tripId) {
        if (data.type === 'START') {
          setStartOtpCode(data.otp);
          showToast('Driver has arrived! Provide this OTP to start the trip.', 'info');
        } else if (data.type === 'COMPLETION') {
          setStartOtpCode(data.otp); // Reuse the same UI element for completion OTP
          showToast('You have reached! Provide this OTP to complete the trip.', 'info');
        }
      }
    });

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
    };
  }, [tripId, router, showToast]);

  // Per-Rider OTP verification by Driver - calls real backend API
  const handleVerifyRiderOtp = async (riderId: string) => {
    const targetRider = acceptedRiders.find((r) => r.id === riderId);
    if (!targetRider || !targetRider.otpInput?.trim()) {
      showToast('Please enter the 4-digit OTP provided by passenger', 'error');
      return;
    }

    try {
      await apiRequest(`/trips/${tripId}/verify-start-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: targetRider.otpInput.trim() }),
      });
      setAcceptedRiders((prev) =>
        prev.map((r) => (r.id === riderId ? { ...r, otpVerified: true, status: 'VERIFIED' } : r))
      );
      showToast(`✅ ${targetRider.name}'s seat verified! OTP accepted.`, 'success');
    } catch (err: any) {
      showToast(`OTP verification failed: ${err.message}`, 'error');
    }
  };

  const handleRiderNoShow = (riderId: string) => {
    setRiderForNoShow(riderId);
    setShowNoShowModal(true);
  };

  const confirmNoShow = async () => {
    if (!riderForNoShow) return;
    try {
      await apiRequest(`/trips/${tripId}/no-show`, {
        method: 'POST',
        body: JSON.stringify({ rideRequestId: riderForNoShow }),
      });
      setAcceptedRiders((prev) =>
        prev.map((r) => (r.id === riderForNoShow ? { ...r, status: 'NO_SHOW' } : r))
      );
      showToast('Passenger marked as No-Show. Seat released in inventory.', 'info');
    } catch (err: any) {
      showToast(`Failed to mark No-Show: ${err.message}`, 'error');
    } finally {
      setShowNoShowModal(false);
      setRiderForNoShow(null);
    }
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Live trip link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (loading) {
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-center space-y-3 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Trip Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">This trip may have been cancelled or you may not have access to it.</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>Go Back</Button>
          </div>
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
        {!isCompleted && connectionState === 'DISCONNECTED' && (
          <div className="p-3.5 bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>🔴 Connection lost. Reconnecting live GPS WebSocket stream...</span>
            </div>
            <Badge variant="danger">Connection Lost</Badge>
          </div>
        )}

        {/* Header Card */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <Badge variant={isCompleted ? 'success' : 'info'}>
                {tripStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isCompleted
                ? 'Trip Completed Successfully • Route Summary Recorded'
                : isDriver
                ? 'Driver Live Trip Room • You are sharing your route with verified campus riders'
                : 'Rider Live Tracking Room • ETA: 12 mins'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isCompleted && (
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  connectionState === 'CONNECTED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300'
                }`}
              >
                {connectionState === 'CONNECTED' ? <>🟢 Connected</> : <>🟡 Reconnecting</>}
              </span>
            )}

            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} leftIcon={<Share2 className="w-3.5 h-3.5 text-teal-500" />}>
              Share Trip
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHelpModal(true)} leftIcon={<Shield className="w-3.5 h-3.5 text-rose-500" />}>
              Help & Safety
            </Button>
          </div>
        </Card>

        {/* ROLE & STATE-SPECIFIC SAFETY INSTRUCTIONS CARD */}
        {isCompleted ? (
          <Card className="p-5 space-y-2 border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Trip Completed • Official Route Record</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              This trip has finished. The route summary below shows the verified pickup, dropoff, and driver details.
            </p>
          </Card>
        ) : isDriver ? (
          /* DRIVER SAFETY INSTRUCTIONS */
          <Card className="p-5 space-y-3 border-2 border-teal-200 dark:border-cyan-800/80 bg-teal-50/40 dark:bg-cyan-950/20 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-[#1e3a8a] dark:text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
              <span>Driver Safety Guidance & Identity Verification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>✓ Ask each rider for their OTP after physically meeting them.</div>
              <div>✓ Verify each rider's identity before starting their seat.</div>
              <div>✓ Confirm correct rider before verifying their 4-digit OTP.</div>
              <div>✓ Keep your eyes on the road during live navigation.</div>
            </div>
          </Card>
        ) : (
          /* RIDER PRE-BOARDING SAFETY WARNING (ONLY DURING ACCEPTED / OTP_PENDING) */
          (tripStatus === 'ACCEPTED' || tripStatus === 'OTP_PENDING') && (
            <Card className="p-5 space-y-3 border-2 border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Check your ride — Pre-Boarding Safety</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 font-extrabold flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>🔒 Never share your 4-digit OTP code before physically meeting your driver.</span>
              </div>
            </Card>
          )
        )}

        {/* MAIN DESKTOP LAYOUT: 75% INFORMATION / 25% MAP SIDE-BY-SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 75% PRIMARY INFORMATION PANEL (8 columns on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Accepted Riders & Per-Rider OTP List (For Driver View) */}
            {isDriver && !isCompleted && (
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
                    ACCEPTED RIDERS & PER-RIDER OTP VERIFICATION
                  </h2>
                  <Badge variant="info">{acceptedRiders.length} Passengers</Badge>
                </div>

                <div className="space-y-4">
                  {acceptedRiders.map((rider) => (
                    <div
                      key={rider.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{rider.name}</span>
                            <Badge variant="verified">✓ Verified</Badge>
                            <span className="text-xs font-bold text-teal-600 dark:text-cyan-400 bg-teal-50 dark:bg-cyan-950 px-2 py-0.5 rounded-md">
                              Seat #{rider.seatNumber}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Pickup: {rider.pickupName}
                          </div>
                        </div>

                        <Badge variant={rider.otpVerified ? 'success' : rider.status === 'NO_SHOW' ? 'danger' : 'warning'}>
                          {rider.otpVerified ? 'OTP VERIFIED' : rider.status === 'NO_SHOW' ? 'NO-SHOW' : 'OTP PENDING'}
                        </Badge>
                      </div>

                      {/* OTP Input Form per Rider */}
                      {!rider.otpVerified && rider.status !== 'NO_SHOW' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex-1 w-full">
                            <Input
                              placeholder="Enter 4-digit passenger OTP"
                              maxLength={4}
                              value={rider.otpInput || ''}
                              onChange={(e) =>
                                setAcceptedRiders((prev) =>
                                  prev.map((r) => (r.id === rider.id ? { ...r, otpInput: e.target.value } : r))
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="teal"
                              size="sm"
                              onClick={() => handleVerifyRiderOtp(rider.id)}
                            >
                              Verify OTP
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRiderNoShow(rider.id)}
                            >
                              No-Show
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Rider View OTP Display */}
            {!isDriver && !isCompleted && (tripStatus === 'ACCEPTED' || tripStatus === 'STARTED' || tripStatus === 'COMPLETION_PENDING') && startOtpCode && (
              <Card className="p-6 space-y-3 bg-teal-50/60 dark:bg-cyan-950/40 border-2 border-teal-300 dark:border-cyan-800 text-center">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Your 4-Digit Initiation OTP</div>
                <div className="font-mono text-4xl font-extrabold text-teal-700 dark:text-cyan-300 tracking-widest">
                  {startOtpCode}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide this code to driver {trip.driver_name || 'Rahul Kumar'} upon meeting at your pickup landmark.
                </p>
              </Card>
            )}

            {/* Visual Trip Progress Bar with Strict States */}
            <Card className="p-4 space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Trip Progress Bar</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-bold">
                {TRIP_STEPS.map((step, idx) => {
                  const isPast = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isFuture = idx > currentStepIdx;

                  return (
                    <div
                      key={step}
                      className={`py-1.5 px-1 rounded-xl border transition flex items-center justify-center gap-1 ${
                        isPast
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                          : isCurrent
                          ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-400 dark:border-cyan-700 shadow-sm ring-2 ring-teal-400/30'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-75'
                      }`}
                    >
                      <span>{isPast ? '✓' : isCurrent ? '●' : '○'}</span>
                      <span className="truncate">{step.replace('_', ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Trip Details Overview */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Trip Route & Driver Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>Route: <strong>{trip.origin_name} ➔ {trip.destination_name}</strong></div>
                <div>Driver: <strong>{trip.driver_name || 'Rahul Kumar'}</strong></div>
                <div>Vehicle: <strong>{trip.vehicle || 'Honda Civic (Silver PB-08-AB-1234)'}</strong></div>
                <div>Departure: <strong>{formatDepartureTime(trip.departure_time)}</strong></div>
              </div>
            </Card>
          </div>

          {/* 25% SIDE PANEL MAP ON DESKTOP (4 columns on lg) */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            <Card className="p-3 space-y-2 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-1.5">
                  <Navigation2 className="w-3.5 h-3.5 text-teal-500" />
                  {isCompleted ? 'Route Summary Map' : 'Live Trip Map'}
                </span>
                <Badge variant={isCompleted ? 'success' : 'info'}>
                  {isCompleted ? 'Completed' : 'Live Stream'}
                </Badge>
              </div>

              {/* Compact Side Panel Map Container */}
              <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <Map origin={originPoint} destination={destPoint} driverLocation={driverLocation || originPoint} />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1 flex justify-between">
                <span>Pickup: {trip.origin_name}</span>
                <span>Dropoff: {trip.destination_name}</span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Live Trip Tracking">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">Share this tracking link with family or emergency contacts:</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[11px]" />
            <Button variant="teal" size="sm" onClick={copyShareableLink}>
              {copiedLink ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="Safety & Support Center">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">If you experience an emergency, contact campus security immediately:</p>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-bold flex items-center justify-between">
            <span>🚨 Campus Emergency SOS: +91 1800-102-4431</span>
            <Button variant="danger" size="sm">Call</Button>
          </div>
        </div>
      </Modal>

      {/* No-Show Confirmation Modal */}
      <Modal isOpen={showNoShowModal} onClose={() => setShowNoShowModal(false)} title="Confirm No-Show">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to mark this passenger as a No-Show? 
            This will permanently cancel their seat request and release the inventory back to the system.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="danger" className="w-full" onClick={confirmNoShow}>
              Confirm No-Show
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowNoShowModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
