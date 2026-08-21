'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiRequest } from '../../lib/api';
import { User, Ride } from '@campunex/shared';
import { ShieldCheck, Plus, Search, Car, Bike, Clock, Calendar, ChevronRight, CheckCircle2, Navigation2 } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
                Welcome back, {user?.name} 👋
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd]">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Campus Ride-Matching Platform • PostGIS 500m Spatial Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'DRIVER' ? (
              <Link
                href="/rides/create"
                className="px-5 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Offer New Ride
              </Link>
            ) : (
              <Link
                href="/rides/find"
                className="px-5 py-2.5 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Find Campus Ride
              </Link>
            )}
          </div>
        </div>

        {/* Verification Status Banner */}
        {user?.verification_status !== 'VERIFIED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>
              ⚠️ Your campus identity is unverified. Verify your institutional email to publish rides & submit requests.
            </span>
            <Link
              href="/verify"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition shadow-sm"
            >
              Verify Identity
            </Link>
          </div>
        )}

        {/* Driver Section */}
        {user?.role === 'DRIVER' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1e3a8a]">My Published Campus Rides</h2>
              <Link href="/rides/create" className="text-xs text-teal-600 font-bold hover:underline">
                + Offer New Ride
              </Link>
            </div>

            {myRides.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs space-y-3 shadow-sm">
                <p>You haven't offered any rides yet.</p>
                <Link href="/rides/create" className="inline-block px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow">
                  Offer Your First Campus Ride
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 bg-[#e0f2fe] text-[#1e3a8a] text-[10px] font-bold rounded-full border border-[#bae6fd]">
                          STATUS: {ride.status}
                        </span>
                        <span className="text-xs font-bold text-teal-600">
                          🪑 {ride.available_seats} / {ride.total_seats} seats left
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 font-semibold uppercase">ROUTE</div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          <span>{ride.origin_name} ➔ {ride.destination_name}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(ride.departure_time).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <Link
                        href={`/rides/requests?rideId=${ride.id}`}
                        className="text-xs text-[#1e3a8a] hover:underline font-bold flex items-center gap-1"
                      >
                        View Incoming Requests <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rider Section */}
        {user?.role === 'RIDER' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1e3a8a]">My Requested Rides</h2>
              <Link href="/rides/find" className="text-xs text-teal-600 font-bold hover:underline">
                🔍 Find Rides (500m PostGIS)
              </Link>
            </div>

            {myRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs space-y-3 shadow-sm">
                <p>No ride requests submitted yet.</p>
                <Link href="/rides/find" className="inline-block px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow">
                  Search Rides Near You
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">DRIVER</div>
                          <div className="text-sm font-bold text-slate-900">{req.driver_name}</div>
                        </div>

                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            req.status === 'ACCEPTED'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>📍 {req.origin_name} ➔ {req.destination_name}</div>
                        <div>🕒 {new Date(req.departure_time).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
