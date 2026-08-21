'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../lib/api';

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
        // Redirect driver directly to live trip view!
        router.push(`/trip/${res.result.trip.id}`);
      } else {
        // Refresh request list
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Manage Incoming Ride Requests</h1>
        <p className="text-sm text-slate-400">
          Accepting a request reserves a seat atomically and initializes an active Trip room
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-300 text-xs font-bold">
          {actionMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
          No pending requests for this ride.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg"
            >
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">{req.rider_name}</div>
                <div className="text-xs text-slate-400">{req.rider_email}</div>
                <div className="text-[10px] text-slate-500">
                  Requested: {new Date(req.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {req.status === 'REQUESTED' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shadow"
                    >
                      ✓ Accept & Start Trip
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-semibold rounded-lg text-xs transition border border-slate-700 hover:border-rose-800"
                    >
                      ✕ Decline
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading requests...</div>}>
        <RequestsContent />
      </Suspense>
    </div>
  );
}
