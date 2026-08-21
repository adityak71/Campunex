'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { apiRequest } from '../../lib/api';
import { User, Ride } from '@campunex/shared';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await apiRequest('/auth/me');
        setUser(meRes.user);

        if (meRes.user.role === 'DRIVER') {
          const ridesRes = await apiRequest('/rides/my-rides');
          setMyRides(ridesRes.rides || []);
        } else {
          const reqsRes = await apiRequest('/rides/requests/my-requests');
          setMyRequests(reqsRes.requests || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Welcome Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Welcome, {user?.name} 👋
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Campus Ride-Matching Platform • PostGIS 500m Spatial Engine
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user?.role === 'DRIVER' ? (
              <Link
                href="/rides/create"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold rounded-xl text-sm shadow-lg transition"
              >
                + Publish New Ride
              </Link>
            ) : (
              <Link
                href="/rides/find"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold rounded-xl text-sm shadow-lg transition"
              >
                🔍 Search 500m PostGIS Rides
              </Link>
            )}
          </div>
        </div>

        {/* Verification Status Notice */}
        {user?.verification_status !== 'VERIFIED' && (
          <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 flex items-center justify-between text-amber-200 text-xs font-medium">
            <span>
              ⚠️ Your institutional identity is unverified. Verify your campus email to unlock ride creation & requests.
            </span>
            <Link
              href="/verify"
              className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold transition"
            >
              Verify Now
            </Link>
          </div>
        )}

        {/* Driver Published Rides Section */}
        {user?.role === 'DRIVER' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200">My Published Campus Rides</h2>
            {myRides.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm space-y-3">
                <p>You haven't published any rides yet.</p>
                <Link href="/rides/create" className="inline-block px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg text-xs font-bold border border-slate-700">
                  Publish Your First Ride
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-cyan-800/80 transition shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-cyan-400 font-semibold">ROUTE</div>
                        <div className="text-sm font-bold text-white">{ride.origin_name} ➔ {ride.destination_name}</div>
                      </div>
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">
                        {ride.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>🕒 Departure: {new Date(ride.departure_time).toLocaleString()}</div>
                      <div>🪑 Seats: <strong className="text-cyan-300">{ride.available_seats} / {ride.total_seats} available</strong></div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <Link
                        href={`/rides/requests?rideId=${ride.id}`}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        View Incoming Requests ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rider Requests Section */}
        {user?.role === 'RIDER' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200">My Requested Rides</h2>
            {myRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm space-y-3">
                <p>No ride requests submitted yet.</p>
                <Link href="/rides/find" className="inline-block px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg text-xs font-bold border border-slate-700">
                  Search Rides Near You (500m PostGIS)
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-cyan-400 font-semibold">DRIVER</div>
                        <div className="text-sm font-bold text-white">{req.driver_name}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>📍 Route: {req.origin_name} ➔ {req.destination_name}</div>
                      <div>🕒 Departure: {new Date(req.departure_time).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
