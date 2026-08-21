'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Map from '../../../components/Map';
import LocationPicker from '../../../components/LocationPicker';
import { apiRequest } from '../../../lib/api';
import { MatchResult } from '@campunex/shared';

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-xs font-bold">
            POSTGIS 500m SPATIAL ENGINE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Find Campus Rides
          </h1>
          <p className="text-sm text-slate-400">
            Search any address or landmark — latitude & longitude coordinates are automatically resolved
          </p>
        </div>

        {/* Search Parameters Form with Address Autocomplete */}
        <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Proximity Threshold:</span>
              <span className="font-bold text-cyan-400">500 meters (PostGIS LineString Overlap)</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold rounded-xl text-sm shadow-lg transition"
            >
              {loading ? 'Executing PostGIS Query...' : '🔍 Search Matching Rides'}
            </button>
          </div>
        </form>

        {requestStatus && (
          <div className="p-4 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-300 text-xs font-bold">
            {requestStatus}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200">
            PostGIS Matching Results ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <p className="text-base font-semibold">No driver route overlap found within 500m threshold.</p>
              <p className="text-xs text-slate-500">Select your pickup & dropoff addresses above to query active driver routes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((m) => (
                <div
                  key={m.ride.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-cyan-800 transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                          DRIVER: {m.driver_name}
                        </div>
                        <div className="text-lg font-extrabold text-white mt-1">
                          {m.ride.origin_name} ➔ {m.ride.destination_name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm rounded-full shadow">
                          {m.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    {/* PostGIS Distance Breakdown */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400">Pickup Route Proximity:</span>
                        <div className="font-bold text-emerald-400">{m.pickupDistanceMeters} meters</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Dropoff Route Proximity:</span>
                        <div className="font-bold text-emerald-400">{m.dropoffDistanceMeters} meters</div>
                      </div>
                    </div>

                    <Map
                      origin={m.ride.origin}
                      destination={m.ride.destination}
                      routeGeometryGeoJson={m.ride.route_geometry}
                      height="200px"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Seats Available: <strong className="text-cyan-300">{m.ride.available_seats}</strong>
                    </div>
                    <button
                      onClick={() => handleBookRide(m.ride.id)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold text-white rounded-lg text-xs transition shadow"
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
    </div>
  );
}
