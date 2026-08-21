'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../lib/api';

export default function CreateRidePage() {
  const [originName, setOriginName] = useState('LPU Main Gate');
  const [destName, setDestName] = useState('Jalandhar City Railway Station');
  const [originLat, setOriginLat] = useState('31.2536');
  const [originLng, setOriginLng] = useState('75.7037');
  const [destLat, setDestLat] = useState('31.3260');
  const [destLng, setDestLng] = useState('75.5762');
  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [totalSeats, setTotalSeats] = useState(4);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/rides', {
        method: 'POST',
        body: JSON.stringify({
          origin_name: originName,
          destination_name: destName,
          origin: { latitude: parseFloat(originLat), longitude: parseFloat(originLng) },
          destination: { latitude: parseFloat(destLat), longitude: parseFloat(destLng) },
          departure_time: new Date(departureTime).toISOString(),
          total_seats: totalSeats,
        }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Publish New Campus Ride
          </h1>
          <p className="text-sm text-slate-400">
            Coordinates are automatically converted into PostGIS GEOMETRY(LineString, 4326) routes
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">1. Route Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Origin Landmark Name</label>
                <input
                  type="text"
                  required
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Destination Landmark Name</label>
                <input
                  type="text"
                  required
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">2. PostGIS Spatial Coordinates</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Origin Lat</label>
                <input
                  type="text"
                  value={originLat}
                  onChange={(e) => setOriginLat(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Origin Lng</label>
                <input
                  type="text"
                  value={originLng}
                  onChange={(e) => setOriginLng(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Dest Lat</label>
                <input
                  type="text"
                  value={destLat}
                  onChange={(e) => setDestLat(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Dest Lng</label>
                <input
                  type="text"
                  value={destLng}
                  onChange={(e) => setDestLng(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">3. Schedule & Capacity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Departure Time</label>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Available Seats</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition text-sm disabled:opacity-50"
          >
            {loading ? 'Publishing Ride to PostGIS...' : 'Publish Ride'}
          </button>
        </form>
      </main>
    </div>
  );
}
