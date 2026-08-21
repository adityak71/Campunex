'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Map from '../../../components/Map';
import { apiRequest } from '../../../lib/api';
import { getSocketClient } from '../../../lib/socket';
import { GeoPoint, TripStatus, User } from '@campunex/shared';
import { Navigation2, ShieldCheck, Lock, Play, Wifi, CheckCircle2, User as UserIcon, KeyRound } from 'lucide-react';

export default function TripLivePage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('ACCEPTED');
  const [driverLocation, setDriverLocation] = useState<GeoPoint | null>(null);
  const [connectionState, setConnectionState] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED');

  const [otpInput, setOtpInput] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    async function initTrip() {
      try {
        const meRes = await apiRequest('/auth/me');
        setCurrentUser(meRes.user);

        const tripRes = await apiRequest(`/trips/${tripId}`);
        setTrip(tripRes.trip);
        setTripStatus(tripRes.trip.status);
      } catch (err) {
        console.error('Failed to load trip:', err);
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

    socket.on('trip:otp_generated', (data: { otp: string; type: 'START' | 'COMPLETION' }) => {
      setReceivedOtp(data.otp);
      setOtpMessage(`🔑 ${data.type} OTP Code for Driver: ${data.otp}`);
    });

    socket.on('trip:status_change', (data: { status: TripStatus }) => {
      setTripStatus(data.status);
    });

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  const isDriver = currentUser?.role === 'DRIVER' || trip?.driver_id === currentUser?.id;

  const handleRequestStartOtp = async () => {
    try {
      const res = await apiRequest(`/trips/${tripId}/start-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      setOtpMessage('Start OTP generated and delivered to Rider!');
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  const handleVerifyStartOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/trips/${tripId}/verify-start-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: otpInput }),
      });
      setOtpInput('');
      setOtpMessage(res.message);
      setTripStatus(res.result.status);
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  const handleRequestCompletionOtp = async () => {
    try {
      const res = await apiRequest(`/trips/${tripId}/completion-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      setOtpMessage('Completion OTP generated and delivered to Rider!');
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  const handleVerifyCompletionOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`/trips/${tripId}/verify-completion-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: otpInput }),
      });
      setOtpInput('');
      setOtpMessage(res.message);
      setTripStatus(res.result.status);
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  const handleStartDevSimulation = async () => {
    setSimulating(true);
    try {
      await apiRequest(`/dev/trips/${tripId}/simulate-location`, { method: 'POST' });
      setOtpMessage('📡 Dev GPS Simulator active: Moving driver along planned route waypoints...');
    } catch (err: any) {
      setOtpMessage(`Simulation Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
        </div>
      </div>
    );
  }

  const originPoint = { latitude: parseFloat(trip.origin_lat), longitude: parseFloat(trip.origin_lng) };
  const destPoint = { latitude: parseFloat(trip.destination_lat), longitude: parseFloat(trip.destination_lng) };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6 w-full">
        {/* Live Header Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a]">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tripStatus === 'COMPLETED'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd] animate-pulse'
                }`}
              >
                STATUS: {tripStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Driver: <strong>{trip.driver_name}</strong> | Rider: <strong>{trip.rider_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                connectionState === 'CONNECTED'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>WebSocket: {connectionState}</span>
            </span>

            <button
              onClick={handleStartDevSimulation}
              disabled={simulating}
              className="px-3.5 py-1.5 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 text-teal-300" /> {simulating ? 'Simulating...' : '▶ Dev GPS Simulator'}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>🗺️ Live Driver GPS Location Tracking (Socket.IO + Redis Cache)</span>
            <span className="font-bold text-teal-600">Real-Time Coordinate Stream</span>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600" /> Dual OTP Ride Verification Security
              </h2>
              <span className="text-[10px] text-slate-400">4-Digit Redis Hash</span>
            </div>

            {otpMessage && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold space-y-1">
                <div>{otpMessage}</div>
                {receivedOtp && (
                  <div className="text-xl font-mono tracking-widest text-[#1e3a8a] mt-1">
                    Plain OTP: {receivedOtp}
                  </div>
                )}
              </div>
            )}

            {/* Rider View */}
            {!isDriver && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-700">Rider Security Code Badge:</div>
                {receivedOtp ? (
                  <div className="text-center p-4 bg-white border border-teal-200 rounded-xl space-y-1 shadow-sm">
                    <div className="text-xs text-teal-700 font-semibold">Share this code with your Driver:</div>
                    <div className="text-3xl font-mono font-extrabold tracking-widest text-[#1e3a8a]">
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
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">1. Initiation OTP Verification</span>
                      <button
                        onClick={handleRequestStartOtp}
                        className="px-3 py-1 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-lg text-xs transition shadow-sm"
                      >
                        Request Rider OTP
                      </button>
                    </div>

                    <form onSubmit={handleVerifyStartOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit OTP"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <button
                        type="submit"
                        disabled={otpInput.length !== 4}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                      >
                        Verify & Start
                      </button>
                    </form>
                  </div>
                )}

                {['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(tripStatus) && (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">2. Completion OTP Verification</span>
                      <button
                        onClick={handleRequestCompletionOtp}
                        className="px-3 py-1 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-lg text-xs transition shadow-sm"
                      >
                        Request Rider OTP
                      </button>
                    </div>

                    <form onSubmit={handleVerifyCompletionOtp} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-digit OTP"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <button
                        type="submit"
                        disabled={otpInput.length !== 4}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                      >
                        Verify & Complete
                      </button>
                    </form>
                  </div>
                )}

                {tripStatus === 'COMPLETED' && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold text-center">
                    🎉 Trip Completed Successfully! Record permanently saved in PostgreSQL.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trip Summary Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                📋 Trip Summary Details
              </h2>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Trip ID:</span>
                <span className="font-mono font-bold text-slate-800">{trip.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Driver Name:</span>
                <span className="font-bold text-slate-900">{trip.driver_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Rider Name:</span>
                <span className="font-bold text-slate-900">{trip.rider_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Departure Location:</span>
                <span className="font-bold text-slate-900">{trip.origin_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Destination Location:</span>
                <span className="font-bold text-slate-900">{trip.destination_name}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
