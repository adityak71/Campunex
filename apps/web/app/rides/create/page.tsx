'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LocationPicker from '../../../components/LocationPicker';
import { apiRequest } from '../../../lib/api';
import { Navigation2, Car, Calendar, Users, ArrowRight } from 'lucide-react';

export default function CreateRidePage() {
  const [originName, setOriginName] = useState('LPU Main Gate');
  const [originLat, setOriginLat] = useState('31.2536');
  const [originLng, setOriginLng] = useState('75.7037');

  const [destName, setDestName] = useState('Jalandhar City Railway Station');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd] rounded-full text-xs font-bold">
            <Car className="w-3.5 h-3.5" /> DRIVER RIDE OFFER
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Offer a Campus Ride
          </h1>
          <p className="text-xs text-slate-500">
            Type address or landmark — latitude and longitude coordinates auto-fetch for route matching
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">1. Route Location Autocomplete</h2>

            <LocationPicker
              label="Departure Origin Address / Landmark"
              placeholder="Type departure location (e.g., LPU Main Gate)..."
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
              label="Destination Address / Landmark"
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

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">2. Schedule & Seat Capacity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Available Passenger Seats</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing Campus Ride...' : 'Offer Campus Ride'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
