'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LocationPicker from '../../../components/LocationPicker';
import Map from '../../../components/Map';
import MatchBar from '../../../components/MatchBar';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import {
  Navigation2,
  Clock,
  CheckCircle2,
  Car,
  Bike,
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  MapPin,
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

function FindRideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  // Query Params
  const initialPickupLat = searchParams.get('pickup_lat') || '31.2536';
  const initialPickupLng = searchParams.get('pickup_lng') || '75.7037';
  const initialDestLat = searchParams.get('dest_lat') || '31.3260';
  const initialDestLng = searchParams.get('dest_lng') || '75.5762';
  const initialDate = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const initialTimeWindow = searchParams.get('time_window') || 'ANY';
  const initialVehicle = searchParams.get('vehicle') || 'ANY';

  // Search State
  const [originName, setOriginName] = useState('LPU Main Gate');
  const [originLat, setOriginLat] = useState(initialPickupLat);
  const [originLng, setOriginLng] = useState(initialPickupLng);

  const [destName, setDestName] = useState('Jalandhar City Railway Station');
  const [destLat, setDestLat] = useState(initialDestLat);
  const [destLng, setDestLng] = useState(initialDestLng);

  const [searchDate, setSearchDate] = useState(initialDate);
  const [searchTimeWindow, setSearchTimeWindow] = useState(initialTimeWindow);
  const [vehicleFilter, setVehicleFilter] = useState<'ANY' | 'CAR' | 'BIKE'>(initialVehicle as any);

  // Filter & Sort State
  const [filterVehicle, setFilterVehicle] = useState<'ALL' | 'CAR' | 'BIKE'>('ALL');
  const [filterTimeWindow, setFilterTimeWindow] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [filterMatchQuality, setFilterMatchQuality] = useState<'ALL' | '80' | '90'>('ALL');
  const [sortBy, setSortBy] = useState<'BEST_MATCH' | 'CLOSEST_PICKUP' | 'EARLIEST_DEPARTURE'>('BEST_MATCH');

  // Matches & Action State
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRideForRequest, setSelectedRideForRequest] = useState<any | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        pickup_lat: originLat,
        pickup_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
      });

      const res = await apiRequest(`/rides/matches?${queryParams.toString()}`);
      setMatches(res.matches || []);
      if (res.matches && res.matches.length > 0) {
        showToast(`Found ${res.matches.length} compatible open driver ride(s)!`, 'success');
      } else {
        showToast('No matching open rides found within 500m threshold.', 'info');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch compatible rides from PostGIS';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleConfirmRideRequest = async () => {
    if (!selectedRideForRequest) return;
    const rideId = selectedRideForRequest.ride_id;
    setRequestSubmitting(true);

    try {
      await apiRequest(`/rides/${rideId}/requests`, {
        method: 'POST',
        body: JSON.stringify({
          pickup: { latitude: parseFloat(originLat), longitude: parseFloat(originLng) },
          dropoff: { latitude: parseFloat(destLat), longitude: parseFloat(destLng) },
        }),
      });

      setSelectedRideForRequest(null);
      showToast('🎉 Seat request submitted to Driver! Track request status in dashboard.', 'success');
      router.push('/rides/requests');
    } catch (err: any) {
      showToast(`Request Failed: ${err.message}`, 'error');
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const processedMatches = matches
    .filter((m) => {
      // Vehicle Filter
      if (filterVehicle === 'CAR' && (m.vehicle_type || 'CAR').toUpperCase() !== 'CAR') return false;
      if (filterVehicle === 'BIKE' && (m.vehicle_type || '').toUpperCase() !== 'BIKE') return false;

      // Match Quality Filter
      const score = m.match_score || 85;
      if (filterMatchQuality === '80' && score < 80) return false;
      if (filterMatchQuality === '90' && score < 90) return false;

      // Time Window Filter
      if (filterTimeWindow !== 'ALL') {
        const hour = new Date(m.departure_time).getHours();
        if (filterTimeWindow === 'MORNING' && (hour < 6 || hour >= 12)) return false;
        if (filterTimeWindow === 'AFTERNOON' && (hour < 12 || hour >= 17)) return false;
        if (filterTimeWindow === 'EVENING' && (hour < 17 || hour >= 22)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'BEST_MATCH') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'CLOSEST_PICKUP') return (a.pickup_distance || 0) - (b.pickup_distance || 0);
      if (sortBy === 'EARLIEST_DEPARTURE') {
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
      return 0;
    });

  const selectedPointOrigin = { latitude: parseFloat(originLat), longitude: parseFloat(originLng) };
  const selectedPointDest = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="info">DRIVER-FIRST COMMUTE ENGINE</Badge>
        <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
          Find Compatible Driver Rides
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Drivers publish open routes • PostGIS spatial engine matches overlapping routes within 500m proximity
        </p>
      </div>

      {/* Primary Search Card */}
      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LocationPicker
            label="Pickup Origin Landmark"
            placeholder="Type pickup location (e.g., LPU Main Gate)..."
            initialName={originName}
            initialLat={originLat}
            initialLng={originLng}
            otherLocationLat={destLat}
            otherLocationLng={destLng}
            onSelectLocation={(name, lat, lng) => {
              setOriginName(name);
              setOriginLat(lat.toString());
              setOriginLng(lng.toString());
            }}
          />

          <LocationPicker
            label="Dropoff Destination Landmark"
            placeholder="Type destination location (e.g., Jalandhar Station)..."
            initialName={destName}
            initialLat={destLat}
            initialLng={destLng}
            otherLocationLat={originLat}
            otherLocationLng={originLng}
            onSelectLocation={(name, lat, lng) => {
              setDestName(name);
              setDestLat(lat.toString());
              setDestLng(lng.toString());
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Window</label>
            <select
              value={searchTimeWindow}
              onChange={(e) => setSearchTimeWindow(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="ANY">Flexible / Any Time</option>
              <option value="MORNING">Morning (6AM - 12PM)</option>
              <option value="AFTERNOON">Afternoon (12PM - 5PM)</option>
              <option value="EVENING">Evening (5PM - 10PM)</option>
            </select>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle Type</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="ANY">🚘 Any Vehicle (Car / Bike)</option>
              <option value="CAR">🚗 Car Commute Only</option>
              <option value="BIKE">🏍️ Bike Ride Only</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            Proximity Threshold: <strong className="text-teal-600 dark:text-cyan-400">Within 500m Overlap</strong>
          </span>

          <Button
            onClick={fetchMatches}
            isLoading={loading}
            variant="teal"
            size="md"
            leftIcon={<Search className="w-4 h-4" />}
          >
            Find Compatible Rides
          </Button>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Sorting Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs">
          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-teal-500" /> Filters:
            </span>

            {/* Vehicle Filter */}
            <div className="flex gap-1">
              {(['ALL', 'CAR', 'BIKE'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterVehicle(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    filterVehicle === v
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {v === 'ALL' ? 'All Vehicles' : v === 'CAR' ? '🚗 Car' : '🏍️ Bike'}
                </button>
              ))}
            </div>

            {/* Match Quality Filter */}
            <div className="flex gap-1">
              {(['ALL', '80', '90'] as const).map((mq) => (
                <button
                  key={mq}
                  onClick={() => setFilterMatchQuality(mq)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    filterMatchQuality === mq
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mq === 'ALL' ? 'All Matches' : `${mq}%+ Match`}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-500" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="BEST_MATCH">⭐ Best Route Match</option>
              <option value="CLOSEST_PICKUP">📍 Closest Pickup Proximity</option>
              <option value="EARLIEST_DEPARTURE">🕒 Earliest Departure Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* DUAL SPLIT LAYOUT (DESKTOP: MAP + LIST / MOBILE: LIST + MAP TOGGLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Compatible Open Ride Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300">
              Compatible Open Driver Rides ({processedMatches.length})
            </h2>

            <button
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="lg:hidden px-3 py-1.5 bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800 rounded-xl text-xs font-bold"
            >
              {showMobileMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : processedMatches.length === 0 ? (
            <EmptyState
              title="No open driver routes match your search criteria"
              description="Drivers publish routes daily. Try expanding your search date or time window."
            />
          ) : (
            <div className="space-y-4">
              {processedMatches.map((match) => {
                const matchScore = match.match_score || 92;
                const pickupDist = Math.round(match.pickup_distance || 320);
                const isBike = (match.vehicle_type || '').toUpperCase() === 'BIKE';

                return (
                  <Card key={match.ride_id} hoverable className="p-6 space-y-4">
                    {/* Header Driver Info */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-base shadow-sm">
                          {match.driver_name ? match.driver_name.substring(0, 2).toUpperCase() : 'DR'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {match.driver_name}
                            <Badge variant="verified">
                              <ShieldCheck className="w-3 h-3 text-teal-600" /> .edu Verified
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {isBike ? '🏍️ Bike Commute' : '🚗 Car Commute'}
                          </div>
                        </div>
                      </div>

                      {/* Route Match Score Badge */}
                      <div className="text-right">
                        <div className="px-3 py-1 bg-teal-50 dark:bg-cyan-950/80 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800 rounded-xl text-xs font-extrabold">
                          {matchScore}% Route Match
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Pickup {pickupDist}m away
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <MatchBar matchScore={matchScore} />

                    {/* Route Landmarks */}
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Navigation2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        <span>{match.origin_name} ➔ {match.destination_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Departure: <strong>{new Date(match.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({new Date(match.departure_time).toLocaleDateString()})</span>
                      </div>
                    </div>

                    {/* Seats & Request CTA */}
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {match.available_seats} Available Passenger Seat(s)
                      </span>

                      <Button
                        onClick={() => setSelectedRideForRequest(match)}
                        variant="teal"
                        size="sm"
                      >
                        Request Ride Seat
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANE: Interactive Route Match Map (5 Cols) */}
        <div className={`lg:col-span-5 space-y-4 ${showMobileMap ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-20 space-y-3">
            <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
              🗺️ 500m Route Proximity Map Preview
            </h2>

            <Map
              origin={selectedPointOrigin}
              destination={selectedPointDest}
              riderPickup={selectedPointOrigin}
              riderDestination={selectedPointDest}
              matchScore={92}
              pickupDistanceMeters={320}
              height="500px"
            />
          </div>
        </div>
      </div>

      {/* RIDE REQUEST CONFIRMATION MODAL */}
      <Modal
        isOpen={!!selectedRideForRequest}
        onClose={() => setSelectedRideForRequest(null)}
        title="Confirm Ride Seat Request"
      >
        {selectedRideForRequest && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Submit a seat reservation request to driver <strong>{selectedRideForRequest.driver_name}</strong> for this route?
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div>Driver: <strong>{selectedRideForRequest.driver_name}</strong> (.edu Verified)</div>
              <div>Route: <strong>{selectedRideForRequest.origin_name} ➔ {selectedRideForRequest.destination_name}</strong></div>
              <div>Departure: <strong>{new Date(selectedRideForRequest.departure_time).toLocaleString()}</strong></div>
              <div>Proximity: <strong>320m Pickup Distance • 92% Route Match</strong></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRideForRequest(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={handleConfirmRideRequest}
                isLoading={requestSubmitting}
                className="flex-1"
              >
                Confirm Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default function FindRidePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading compatible matches...</div>}>
        <FindRideContent />
      </Suspense>
      <Footer />
    </div>
  );
}
