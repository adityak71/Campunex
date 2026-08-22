'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { ShieldCheck, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';

function RequestsContent() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get('rideId');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<{ id: string; action: 'ACCEPTED' | 'REJECTED' } | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }
    async function loadRequests() {
      try {
        const res = await apiRequest(`/rides/${rideId}/requests`);
        setRequests(res.requests || []);
      } catch (err: any) {
        showToast(err.message || 'Failed to load requests', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [rideId]);

  const confirmAction = async () => {
    if (!selectedReq) return;
    const { id: requestId, action: status } = selectedReq;
    setSelectedReq(null);

    try {
      const res = await apiRequest(`/rides/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      showToast(`Request ${status.toLowerCase()} successfully!`, 'success');

      if (status === 'ACCEPTED' && res.result?.trip?.id) {
        router.push(`/trip/${res.result.trip.id}`);
      } else {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
      <div className="space-y-1">
        <Badge variant="info">INCOMING PASSENGER REQUESTS</Badge>
        <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300">
          Manage Incoming Ride Requests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Accepting a request atomically decrements available seats and initializes an active Trip room
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No pending requests for this ride"
          description="Riders matching your route within 500m proximity will appear here."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              hoverable
              className="flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                  {req.rider_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {req.rider_name}
                    <Badge variant="verified">Verified Rider</Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{req.rider_email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Requested: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {req.status === 'REQUESTED' ? (
                  <>
                    <Button
                      onClick={() => setSelectedReq({ id: req.id, action: 'ACCEPTED' })}
                      variant="teal"
                      size="sm"
                    >
                      ✓ Accept & Start
                    </Button>
                    <Button
                      onClick={() => setSelectedReq({ id: req.id, action: 'REJECTED' })}
                      variant="outline"
                      size="sm"
                    >
                      ✕ Decline
                    </Button>
                  </>
                ) : (
                  <Badge variant={req.status === 'ACCEPTED' ? 'success' : 'danger'}>
                    {req.status}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title={selectedReq?.action === 'ACCEPTED' ? 'Accept Ride Request?' : 'Decline Ride Request?'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            {selectedReq?.action === 'ACCEPTED'
              ? 'Accepting this request will reserve 1 seat for the rider and create a live Trip tracking room.'
              : 'Are you sure you want to decline this rider request?'}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedReq(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={selectedReq?.action === 'ACCEPTED' ? 'teal' : 'danger'}
              size="sm"
              onClick={confirmAction}
              className="flex-1"
            >
              Confirm {selectedReq?.action === 'ACCEPTED' ? 'Accept' : 'Decline'}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading requests...</div>}>
        <RequestsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
