'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { apiRequest } from '../../../lib/api';
import { ShieldCheck, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';

function RequestsContent() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get('rideId');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!rideId) return;
    async function loadRequests() {
      try {
        const res = await apiRequest(`/rides/${rideId}/requests`);
        setRequests(res.requests || []);
      } catch (err: any) {
        console.error('Failed to load requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [rideId]);

  const handleUpdateStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await apiRequest(`/rides/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setActionMessage(`Request ${status.toLowerCase()}!`);

      if (status === 'ACCEPTED' && res.result?.trip?.id) {
        router.push(`/trip/${res.result.trip.id}`);
      } else {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1e3a8a]">Manage Incoming Ride Requests</h1>
        <p className="text-xs text-slate-500">
          Accepting a request atomically decrements available seats and initializes an active Trip room
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> {actionMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-sm">
          No pending requests for this ride.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {req.rider_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {req.rider_name}
                    <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded-full font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{req.rider_email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Requested: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {req.status === 'REQUESTED' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                    >
                      ✓ Accept & Start Trip
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-xl text-xs transition border border-slate-200 hover:border-rose-200"
                    >
                      ✕ Decline
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      req.status === 'ACCEPTED'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading requests...</div>}>
        <RequestsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
