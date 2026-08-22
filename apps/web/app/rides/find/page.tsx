'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { Navigation2, Clock, CheckCircle2, Car, Bike } from 'lucide-react';

function FindRideContent() {
  const searchParams = useSearchParams();
  const initialPickupLat = searchParams.get('pickup_lat') || '31.2536';
  const initialPickupLng = searchParams.get('pickup_lng') || '75.7037';
  const initialDestLat = searchParams.get('dest_lat') || '31.3260';
  const initialDestLng = searchParams.get('dest_lng') || '75.5762';

  const [originName, setOriginName] = useState('LPU Main Gate');
  const [originLat, setOriginLat] = useState(initialPickupLat);
  const [originLng, setOriginLng] = useState(initialPickupLng);

  const [destName, setDestName] = useState('Jalandhar City Railway Station');
  const [destLat, setDestLat] = useState(initialDestLat);
  const [destLng, setDestLng] = useState(initialDestLng);

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setRequestStatus(null);
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
        showToast(`Found ${res.matches.length} matching ride(s)!`, 'success');
      } else {
        showToast('No matching rides found within 500m threshold.', 'info');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to fetch ride matches';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleRequestRide = async (rideId: string) => {
    try {
      const res = await apiRequest(`/rides/${rideId}/request`, {
        method: 'POST',
        body: JSON.stringify({
          pickup_lat: parseFloat(originLat),
          pickup_lng: parseFloat(originLng),
          dest_lat: parseFloat(destLat),
          dest_lng: parseFloat(destLng),
        }),
      });

      const msg = res.message || 'Ride requested successfully!';
      setRequestStatus(msg);
      showToast(msg, 'success');
    } catch (err: any) {
      const errMsg = `Request Failed: ${err.message}`;
      setRequestStatus(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
      <div className="space-y-2">
        <Badge variant="info">500m ROUTE PROXIMITY</Badge>
        <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
          Find Campus Rides Near You
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search campus landmarks or street addresses — real-time route matching within 500m proximity
        </p>
      </div>

      {/* Search Autocomplete Form */}
      <Card className="space-y-6">
        <div className="space-y-6">
          <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
            1. Route Location Autocomplete
          </h2>

          <LocationPicker
            label="Pickup Location / Landmark"
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
            label="Destination Location / Landmark"
            placeholder="Type destination location (e.g., Jalandhar Railway Station)..."
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

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Proximity Threshold: <strong className="text-[#1e3a8a] dark:text-cyan-300">500 meters (Route Overlap)</strong>
          </div>

          <Button
            onClick={handleSearch}
            isLoading={loading}
            variant="teal"
            size="md"
          >
            🔍 Search Matching Rides
          </Button>
        </div>
      </Card>

      {/* Matches Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300">
            Available Rides ({matches.length})
          </h2>
        </div>

        {requestStatus && (
          <div className="p-4 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> {requestStatus}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            title="No driver route overlap found within 500m threshold"
            description="Select your pickup & dropoff addresses above to query available driver routes."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.ride_id} hoverable className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                      {match.driver_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {match.driver_name}
                        <Badge variant="verified">Verified</Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Seats: {match.available_seats} Available</div>
                    </div>
                  </div>
                </div>

                <MatchBar matchScore={match.match_score} />

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Navigation2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span>{match.origin_name} ➔ {match.destination_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Departure: {new Date(match.departure_time).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>Pickup Proximity: <strong className="text-teal-600 dark:text-teal-400">{Math.round(match.pickup_distance)}m</strong></div>
                  <div>Destination Proximity: <strong className="text-teal-600 dark:text-teal-400">{Math.round(match.dest_distance)}m</strong></div>
                </div>

                <Button
                  onClick={() => handleRequestRide(match.ride_id)}
                  variant="teal"
                  size="sm"
                  className="w-full"
                >
                  Request Ride Seat
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function FindRidePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading matches...</div>}>
        <FindRideContent />
      </Suspense>
      <Footer />
    </div>
  );
}
