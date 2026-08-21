'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LocationPicker from '../../../components/LocationPicker';
import Map from '../../../components/Map';
import MatchBar from '../../../components/MatchBar';
import { apiRequest } from '../../../lib/api';
import { Navigation2, Calendar, Clock, User, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';

export default function FindRidePage() {
  const [originName, setOriginName] = useState('LPU Main Gate');
  const [originLat, setOriginLat] = useState('31.2536');
  const [originLng, setOriginLng] = useState('75.7037');

  const [destName, setDestName] = useState('Jalandhar City Railway Station');
  const [destLat, setDestLat] = useState('31.3260');
  const [destLng, setDestLng] = useState('75.5762');

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

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

      setRequestStatus(res.message || 'Ride requested successfully!');
    } catch (err: any) {
      setRequestStatus(`Request Failed: ${err.message}`);
    }
  };

  const originPoint = { latitude: parseFloat(originLat), longitude: parseFloat(originLng) };
  const destPoint = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] dark:bg-cyan-950/80 text-[#1e3a8a] dark:text-cyan-300 border border-[#bae6fd] dark:border-cyan-800 rounded-full text-xs font-bold">
            <Navigation2 className="w-3.5 h-3.5" /> 500m ROUTE PROXIMITY
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Find Campus Rides Near You
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search campus landmarks or street addresses — real-time route matching within 500m proximity
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">1. Route Location Autocomplete</h2>

            <LocationPicker
              label="Pickup Location / Landmark"
              placeholder="Type pickup location (e.g., LPU Main Gate)..."
              initialName={originName}
              initialLat={originLat}
              initialLng={originLng}
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

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-[#1e3a8a] dark:bg-cyan-600 hover:bg-[#1d3271] dark:hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Searching Rides...' : '🔍 Search Matching Rides'}
            </button>
          </div>
        </div>

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

          {matches.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-sm">
              <p className="text-sm font-semibold">No driver route overlap found within 500m threshold.</p>
              <p className="text-xs text-slate-400">Select your pickup & dropoff addresses above to query available driver routes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <div
                  key={match.ride_id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                        {match.driver_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {match.driver_name}
                          <span className="text-[10px] bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded-full font-semibold">
                            Verified
                          </span>
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

                  <button
                    onClick={() => handleRequestRide(match.ride_id)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Request Ride Seat
                  </button>
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
