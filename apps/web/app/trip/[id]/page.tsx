'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Map from '../../../components/Map';
import { apiRequest } from '../../../lib/api';
import { getSocketClient } from '../../../lib/socket';
import { GeoPoint, TripStatus, User } from '@campunex/shared';

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

    // Listen for live driver GPS location updates
    socket.on('trip:location_update', (data: { latitude: number; longitude: number }) => {
      setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    // Listen for OTP generation (Plain OTP delivered securely to Rider)
    socket.on('trip:otp_generated', (data: { otp: string; type: 'START' | 'COMPLETION' }) => {
      setReceivedOtp(data.otp);
      setOtpMessage(`🔑 ${data.type} OTP Code for Driver: ${data.otp}`);
    });

    // Listen for Trip status transitions
    socket.on('trip:status_change', (data: { status: TripStatus }) => {
      setTripStatus(data.status);
    });

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  const isDriver = currentUser?.role === 'DRIVER' || trip?.driver_id === currentUser?.id;

  // Driver requests Start OTP
  const handleRequestStartOtp = async () => {
    try {
      const res = await apiRequest(`/trips/${tripId}/start-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      setOtpMessage('Start OTP generated and delivered to Rider!');
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  // Driver submits 4-digit Start OTP
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

  // Driver requests Completion OTP
  const handleRequestCompletionOtp = async () => {
    try {
      const res = await apiRequest(`/trips/${tripId}/completion-otp`, { method: 'POST' });
      if (res.devOtp) setReceivedOtp(res.devOtp);
      setOtpMessage('Completion OTP generated and delivered to Rider!');
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    }
  };

  // Driver submits 4-digit Completion OTP
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

  // Trigger Dev GPS Simulator
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  const originPoint = { latitude: parseFloat(trip.origin_lat), longitude: parseFloat(trip.origin_lng) };
  const destPoint = { latitude: parseFloat(trip.destination_lat), longitude: parseFloat(trip.destination_lng) };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {trip.origin_name} ➔ {trip.destination_name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tripStatus === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : tripStatus === 'IN_PROGRESS' || tripStatus === 'STARTED'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                STATUS: {tripStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Driver: <strong>{trip.driver_name}</strong> | Rider: <strong>{trip.rider_name}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                connectionState === 'CONNECTED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>WebSocket: {connectionState}</span>
            </span>

            {/* Dev GPS Simulator Button */}
            <button
              onClick={handleStartDevSimulation}
              disabled={simulating}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold rounded-lg text-xs transition shadow"
            >
              {simulating ? 'Simulating...' : '▶ Dev GPS Simulator'}
            </button>
          </div>
        </div>

        {/* Live Leaflet Map Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>🗺️ Live Driver GPS Location Tracking</span>
            <span>Update Interval: 2s (Redis Ephemeral Cache)</span>
          </div>
          <Map
            origin={originPoint}
            destination={destPoint}
            driverLocation={driverLocation}
            routeGeometryGeoJson={trip.route_geometry}
            height="450px"
          />
        </div>

        {/* Dual OTP & Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OTP Security Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                🔐 Dual OTP Ride Verification Security
              </h2>
              <span className="text-[10px] text-slate-500">4-Digit Redis Hash Verification</span>
            </div>

            {otpMessage && (
              <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-300 text-xs font-bold space-y-1">
                <div>{otpMessage}</div>
                {receivedOtp && (
                  <div className="text-lg font-mono tracking-widest text-emerald-400 mt-1">
                    Plain OTP: {receivedOtp}
                  </div>
                )}
              </div>
            )}

            {/* Rider View: Show Plain OTP Code */}
            {!isDriver && (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Rider OTP Security Badge:</div>
                {receivedOtp ? (
                  <div className="text-center p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-1">
                    <div className="text-xs text-emerald-300">Share this code with your Driver:</div>
                    <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-400">
                      {receivedOtp}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">
                    Waiting for driver to initiate Start or Completion OTP stage...
                  </div>
                )}
              </div>
            )}

            {/* Driver Controls */}
            {isDriver && (
              <div className="space-y-4">
                {/* Stage 1: Start OTP */}
                {['ACCEPTED', 'OTP_PENDING'].includes(tripStatus) && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">1. Initiation OTP Verification</span>
                      <button
                        onClick={handleRequestStartOtp}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition"
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
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <button
                        type="submit"
                        disabled={otpInput.length !== 4}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
                      >
                        Verify & Start Trip
                      </button>
                    </form>
                  </div>
                )}

                {/* Stage 2: Completion OTP */}
                {['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(tripStatus) && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">2. Completion OTP Verification</span>
                      <button
                        onClick={handleRequestCompletionOtp}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition"
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
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center text-sm font-bold tracking-widest"
                      />
                      <button
                        type="submit"
                        disabled={otpInput.length !== 4}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
                      >
                        Verify & Complete Trip
                      </button>
                    </form>
                  </div>
                )}

                {tripStatus === 'COMPLETED' && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold text-center">
                    🎉 Trip Completed Successfully! Record permanently persisted in PostgreSQL.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trip Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                📋 Trip Summary Details
              </h2>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Trip ID:</span>
                <span className="font-mono text-slate-200">{trip.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Driver:</span>
                <span className="font-semibold text-white">{trip.driver_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Rider:</span>
                <span className="font-semibold text-white">{trip.rider_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Origin:</span>
                <span className="font-semibold text-white">{trip.origin_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Destination:</span>
                <span className="font-semibold text-white">{trip.destination_name}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
