'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Map from '../../../components/Map';
import LocationPicker from '../../../components/LocationPicker';
import { apiRequest } from '../../../lib/api';
import { MatchResult } from '@campunex/shared';
import { Navigation2, Search, Star, ShieldCheck, Car, CheckCircle2, ChevronRight } from 'lucide-react';

function MatchBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? 'bg-teal-500' : percent >= 75 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${percent >= 90 ? 'text-teal-600' : percent >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
        {percent}%
      </span>
    </div>
  );
}

export default function FindRidePage() {
  const [pickupName, setPickupName] = useState('LPU Main Gate');
  const [pickupLat, setPickupLat] = useState('31.2540');
  const [pickupLng, setPickupLng] = useState('75.7030');

  const [dropoffName, setDropoffName] = useState('Jalandhar City Railway Station');
  const [dropoffLat, setDropoffLat] = useState('31.3255');
  const [dropoffLng, setDropoffLng] = useState('75.5768');

  const [maxDistance] = useState('500');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRequestStatus(null);

    try {
      const res = await apiRequest(
        `/rides/matches?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&dropoff_lat=${dropoffLat}&dropoff_lng=${dropoffLng}&max_distance_meters=${maxDistance}`
      );
      setMatches(res.matches || []);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (rideId: string) => {
    try {
      await apiRequest(`/rides/${rideId}/requests`, {
        method: 'POST',
        body: JSON.stringify({
          pickup: { latitude: parseFloat(pickupLat), longitude: parseFloat(pickupLng) },
          dropoff: { latitude: parseFloat(dropoffLat), longitude: parseFloat(dropoffLng) },
        }),
      });
      setRequestStatus(`Request submitted successfully for ride ${rideId}!`);
    } catch (err: any) {
      setRequestStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd] rounded-full text-xs font-bold">
            <Navigation2 className="w-3.5 h-3.5" /> POSTGIS 500m SPATIAL ENGINE
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Find Campus Rides
          </h1>
          <p className="text-xs text-slate-500">
            Search campus landmarks or street addresses — coordinates auto-fetch and measure PostGIS route line overlaps
          </p>
        </div>

        {/* Search Autocomplete Form */}
        <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocationPicker
              label="1. Pickup Address / Landmark"
              placeholder="Type campus pickup location (e.g., LPU Main Gate)..."
              initialName={pickupName}
              initialLat={pickupLat}
              initialLng={pickupLng}
              onSelectLocation={(name, lat, lng) => {
                setPickupName(name);
                setPickupLat(lat.toString());
                setPickupLng(lng.toString());
              }}
            />

            <LocationPicker
              label="2. Dropoff Address / Destination"
              placeholder="Type campus dropoff location (e.g., Jalandhar Railway Station)..."
              initialName={dropoffName}
              initialLat={dropoffLat}
              initialLng={dropoffLng}
              onSelectLocation={(name, lat, lng) => {
                setDropoffName(name);
                setDropoffLat(lat.toString());
                setDropoffLng(lng.toString());
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Proximity Threshold: <strong className="text-[#1e3a8a]">500 meters (PostGIS LineString Overlap)</strong>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
            >
              {loading ? 'Executing PostGIS Query...' : '🔍 Search Matching Rides'}
            </button>
          </div>
        </form>

        {requestStatus && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> {requestStatus}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1e3a8a]">
            PostGIS Matching Results ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
              <p className="text-sm font-semibold">No driver route overlap found within 500m threshold.</p>
              <p className="text-xs text-slate-400">Select your pickup & dropoff addresses above to query available driver routes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((m) => (
                <div
                  key={m.ride.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {m.driver_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              {m.driver_name}
                              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                Verified
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">Vehicle: Campus Driver</div>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-[#1e3a8a] mt-2">
                          {m.ride.origin_name} ➔ {m.ride.destination_name}
                        </div>
                      </div>

                      <div className="text-right w-28">
                        <MatchBar percent={m.matchScore} />
                      </div>
                    </div>

                    {/* PostGIS Distance Callouts */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400">Pickup Proximity:</span>
                        <div className="font-bold text-teal-600">{m.pickupDistanceMeters}m (Threshold &le; 500m)</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Dropoff Proximity:</span>
                        <div className="font-bold text-teal-600">{m.dropoffDistanceMeters}m (Threshold &le; 500m)</div>
                      </div>
                    </div>

                    <Map
                      origin={m.ride.origin}
                      destination={m.ride.destination}
                      routeGeometryGeoJson={m.ride.route_geometry}
                      height="180px"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Seats Available: <strong className="text-[#1e3a8a]">{m.ride.available_seats}</strong>
                    </div>
                    <button
                      onClick={() => handleBookRide(m.ride.id)}
                      className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#1d3271] font-bold text-white rounded-xl text-xs transition shadow-sm"
                    >
                      Request Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
