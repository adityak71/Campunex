'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiRequest } from '../../lib/api';
import { Navigation2, Calendar, Clock, CheckCircle2, ChevronRight, History } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await apiRequest('/trips/history/my-history');
        setHistory(res.history || []);
      } catch (err) {
        console.error('Failed to load trip history:', err);
      } fontFinally: {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd] rounded-full text-xs font-bold">
            <History className="w-3.5 h-3.5" /> TRIP LOG & HISTORY
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
            Trip History
          </h1>
          <p className="text-xs text-slate-500">
            Permanent transactional record of your completed and past campus trips stored in PostgreSQL
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mx-auto"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-sm space-y-3">
            <p className="font-semibold text-sm">No trip history recorded yet.</p>
            <Link href="/rides/find" className="inline-block px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow">
              Search Rides Near You
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {history.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        trip.status === 'COMPLETED'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {trip.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>{trip.origin_name} ➔ {trip.destination_name}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div>Driver: <strong>{trip.driver_name}</strong></div>
                    <div>Rider: <strong>{trip.rider_name}</strong></div>
                    {trip.completed_at && (
                      <div className="text-[10px] text-teal-700 font-semibold mt-1">
                        ✓ Completed: {new Date(trip.completed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="text-xs text-[#1e3a8a] hover:underline font-bold flex items-center gap-1"
                  >
                    View Trip Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
