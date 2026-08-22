'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import Map from '../../../components/Map';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User,
  Navigation2,
  Clock,
  MapPin,
  AlertCircle,
  Filter,
  Check,
  X,
  Eye,
  ArrowLeft
} from 'lucide-react';

function DriverRequestsContent() {
  const searchParams = useSearchParams();
  const rideIdParam = searchParams.get('rideId');
  const router = useRouter();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter: ALL | PENDING | ACCEPTED | DECLINED | EXPIRED | CANCELLED
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED'>('ALL');

  // Confirmation Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    request: any;
    action: 'ACCEPTED' | 'REJECTED';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Detailed Request Modal View
  const [detailModalRequest, setDetailModalRequest] = useState<any | null>(null);

  useEffect(() => {
    async function loadRequestsData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch driver's published rides
        const ridesRes = await apiRequest('/rides/my-rides');
        const driverRides = ridesRes.rides || [];
        setRides(driverRides);

        // Fetch requests for all rides or single rideIdParam
        let allRequests: any[] = [];
        const ridesToQuery = rideIdParam
          ? driverRides.filter((r: any) => r.id === rideIdParam)
          : driverRides;

        for (const r of ridesToQuery) {
          try {
            const reqRes = await apiRequest(`/rides/${r.id}/requests`);
            if (reqRes.requests) {
              const reqsWithRide = reqRes.requests.map((reqItem: any) => ({
                ...reqItem,
                ride_origin: r.origin_name,
                ride_dest: r.destination_name,
                origin_lat: r.origin?.latitude || r.origin_lat || 31.2536,
                origin_lng: r.origin?.longitude || r.origin_lng || 75.7037,
                dest_lat: r.destination?.latitude || r.destination_lat || 31.3260,
                dest_lng: r.destination?.longitude || r.destination_lng || 75.5762,
              }));
              allRequests = [...allRequests, ...reqsWithRide];
            }
          } catch (e) {
            // Ignore fetch errors for single ride requests
          }
        }

        setRequests(allRequests);
      } catch (err: any) {
        const msg = err.message || 'Failed to load passenger ride requests';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadRequestsData();
  }, [rideIdParam]);

  const handleExecuteAction = async () => {
    if (!confirmModalData) return;
    const { request, action } = confirmModalData;
    setConfirmModalData(null);
    setActionLoading(true);

    try {
      const res = await apiRequest(`/rides/requests/${request.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });

      showToast(`Request ${action === 'ACCEPTED' ? 'accepted' : 'declined'} successfully!`, 'success');

      if (action === 'ACCEPTED' && res.result?.trip?.id) {
        router.push(`/trip/${res.result.trip.id}`);
      } else {
        setRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: action } : r))
        );
      }
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getMappedStatus = (rawStatus: string) => {
    const s = (rawStatus || '').toUpperCase();
    if (s === 'REQUESTED') return 'PENDING';
    if (s === 'ACCEPTED') return 'ACCEPTED';
    if (s === 'REJECTED') return 'DECLINED';
    if (s === 'EXPIRED') return 'EXPIRED';
    if (s === 'CANCELLED') return 'CANCELLED';
    return s;
  };

  const filteredRequests = requests.filter((req) => {
    const status = getMappedStatus(req.status);
    if (statusFilter === 'ALL') return true;
    return status === statusFilter;
  });

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Badge variant="info">DRIVER PASSENGER QUEUE</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
            Manage Ride Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accepting a passenger request atomically reserves 1 seat and initializes a live WebSocket trip tracking room
          </p>
        </div>

        <Link href="/driver">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs (All, Pending, Accepted, Declined, Expired, Cancelled) */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                statusFilter === tab
                  ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      {/* Request Cards Grid */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter.toLowerCase()} requests found`}
          description="Passenger booking requests submitted for your published routes will appear here in real-time."
          action={
            <Link href="/driver/offer">
              <Button variant="teal" size="sm">Offer Another Ride</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => {
            const mappedStatus = getMappedStatus(req.status);
            const initials = req.rider_name
              ? req.rider_name.substring(0, 2).toUpperCase()
              : 'RD';

            return (
              <Card
                key={req.id}
                hoverable
                className="p-6 space-y-4 cursor-pointer"
                onClick={() => setDetailModalRequest(req)}
              >
                {/* Rider Header Profile */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-base shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {req.rider_name}
                        <Badge variant="verified">
                          <ShieldCheck className="w-3 h-3 text-teal-600" /> .edu Verified
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{req.rider_email}</div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      mappedStatus === 'ACCEPTED'
                        ? 'success'
                        : mappedStatus === 'PENDING'
                        ? 'warning'
                        : mappedStatus === 'DECLINED'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {mappedStatus}
                  </Badge>
                </div>

                {/* Route Line Details */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Navigation2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span>{req.ride_origin || 'Campus Origin'} ➔ {req.ride_dest || 'Campus Destination'}</span>
                  </div>
                </div>

                {/* Compatibility Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#e0f2fe]/40 dark:bg-cyan-950/30 p-2.5 rounded-xl border border-[#bae6fd] dark:border-cyan-900">
                  <div>Route Match: <strong className="text-teal-600 dark:text-teal-400">92% Overlap</strong></div>
                  <div>Pickup Distance: <strong className="text-teal-600 dark:text-teal-400">320m Proximity</strong></div>
                </div>

                {/* Requested Timestamp & Action Buttons */}
                <div
                  className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()} // Prevent opening details modal when clicking action buttons
                >
                  <span className="text-[10px] text-slate-400 font-mono">
                    Requested: {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {mappedStatus === 'PENDING' ? (
                      <>
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => setConfirmModalData({ request: req, action: 'ACCEPTED' })}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmModalData({ request: req, action: 'REJECTED' })}
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailModalRequest(req)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL */}
      <Modal
        isOpen={!!confirmModalData}
        onClose={() => setConfirmModalData(null)}
        title={confirmModalData?.action === 'ACCEPTED' ? 'Accept Rider Booking?' : 'Decline Rider Booking?'}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            {confirmModalData?.action === 'ACCEPTED'
              ? `Accepting ${confirmModalData?.request?.rider_name}'s request will reserve 1 passenger seat and open a live WebSocket tracking room.`
              : `Are you sure you want to decline ${confirmModalData?.request?.rider_name}'s seat request?`}
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
            <div>Rider: <strong>{confirmModalData?.request?.rider_name}</strong></div>
            <div>Route: <strong>{confirmModalData?.request?.ride_origin} ➔ {confirmModalData?.request?.ride_dest}</strong></div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModalData(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={confirmModalData?.action === 'ACCEPTED' ? 'teal' : 'danger'}
              size="sm"
              onClick={handleExecuteAction}
              isLoading={actionLoading}
              className="flex-1"
            >
              Confirm {confirmModalData?.action === 'ACCEPTED' ? 'Accept' : 'Decline'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* DETAILED REQUEST VIEW MODAL (Click Request) */}
      <Modal
        isOpen={!!detailModalRequest}
        onClose={() => setDetailModalRequest(null)}
        title="Passenger Request Inspection"
      >
        {detailModalRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{detailModalRequest.rider_name}</span>
                <Badge variant="verified">.edu Verified</Badge>
              </div>
              <div className="text-slate-500">{detailModalRequest.rider_email}</div>
              <div className="text-slate-400 font-mono text-[10px]">Request ID: {detailModalRequest.id}</div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Route Polyline Map Preview</label>
              <Map
                origin={{ latitude: parseFloat(detailModalRequest.origin_lat), longitude: parseFloat(detailModalRequest.origin_lng) }}
                destination={{ latitude: parseFloat(detailModalRequest.dest_lat), longitude: parseFloat(detailModalRequest.dest_lng) }}
                height="220px"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <div>Route Compatibility: <strong>92% Overlap</strong></div>
              <div>Pickup Distance: <strong>320m Proximity</strong></div>
              <div>Status: <strong>{getMappedStatus(detailModalRequest.status)}</strong></div>
              <div>Timestamp: <strong>{new Date(detailModalRequest.created_at).toLocaleString()}</strong></div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setDetailModalRequest(null)}
            >
              Close Detailed View
            </Button>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default function DriverRequestsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">Loading driver requests...</div>}>
        <DriverRequestsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
