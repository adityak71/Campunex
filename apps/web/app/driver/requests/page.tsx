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
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import Map from '../../../components/Map';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { formatDepartureTime } from '../../../lib/formatters';
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

        const endpoint = `/rides/driver-requests${rideIdParam ? `?rideId=${rideIdParam}` : ''}`;
        const res = await apiRequest(endpoint);
        setRequests(res.requests || []);
      } catch (err: any) {
        const msg = err.message || 'Failed to load your published ride requests';
        setError(msg);
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

  return (
    <WorkspaceLayout
      title="Manage Ride Requests"
      subtitle="Accepting a passenger request atomically reserves 1 seat and initializes a live WebSocket trip tracking room"
      mode="driver"
    >
      <div className="space-y-6">

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter Tabs (All, Pending, Accepted, Declined, Expired, Cancelled) */}
      {!error && (
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[22px]">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  statusFilter === tab
                    ? 'bg-accent1/20 text-accent1 border-accent1/50 shadow-[0_0_10px_rgba(181,108,255,0.2)]'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Request Grid Hierarchy */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : error ? null : filteredRequests.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter.toLowerCase()} requests found`}
          description="Passenger booking requests submitted for your published routes will appear here in real-time."
          action={
            <Link href="/driver/offer">
              <Button variant="primary" size="sm">Offer Another Ride</Button>
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
              <div
                key={req.id}
                className="p-6 space-y-4 cursor-pointer bg-white/[0.03] border border-white/5 hover:border-accent1/30 rounded-[24px] transition-all hover:bg-white/[0.05]"
                onClick={() => setDetailModalRequest(req)}
              >
                {/* Rider Header Profile */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent1/20 text-accent1 flex items-center justify-center font-extrabold text-base shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {req.rider_name}
                        <Badge variant="verified">
                          <ShieldCheck className="w-3 h-3 text-accent2" /> .edu Verified
                        </Badge>
                      </div>
                      <div className="text-xs text-white/50">{req.rider_email}</div>
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
                <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Navigation2 className="w-3.5 h-3.5 text-accent1 flex-shrink-0" />
                    <span>{req.ride_origin || 'Campus Origin'} ➔ {req.ride_dest || 'Campus Destination'}</span>
                  </div>
                </div>

                {/* Request Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="text-white/60">
                    Seats Available: <strong className="text-accent2">{req.available_seats ?? '--'}</strong>
                  </div>
                  <div className="text-white/60 whitespace-nowrap">
                    Request Time: <strong className="text-accent2">{formatDepartureTime(req.created_at)}</strong>
                  </div>
                </div>

                {/* Requested Timestamp & Action Buttons */}
                <div
                  className="flex justify-between items-center pt-2 border-t border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-white/40 font-mono hidden sm:inline-block">
                    Requested: {formatDepartureTime(req.created_at)}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono sm:hidden">
                    {formatDepartureTime(req.created_at)}
                  </span>

                  <div className="flex items-center gap-2">
                    {mappedStatus === 'PENDING' ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Check className="w-4 h-4" />}
                          onClick={() => setConfirmModalData({ request: req, action: 'ACCEPTED' })}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<X className="w-4 h-4" />}
                          onClick={() => setConfirmModalData({ request: req, action: 'REJECTED' })}
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => setDetailModalRequest(req)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
          <p className="text-white/70">
            {confirmModalData?.action === 'ACCEPTED'
              ? `Accepting ${confirmModalData?.request?.rider_name}'s request will reserve 1 passenger seat and open a live WebSocket tracking room.`
              : `Are you sure you want to decline ${confirmModalData?.request?.rider_name}'s seat request?`}
          </p>

          <div className="p-3 bg-white/5 border border-white/10 text-white/80 rounded-xl space-y-1">
            <div>Rider: <strong className="text-white">{confirmModalData?.request?.rider_name}</strong></div>
            <div>Route: <strong className="text-white">{confirmModalData?.request?.ride_origin} ➔ {confirmModalData?.request?.ride_dest}</strong></div>
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
              variant={confirmModalData?.action === 'ACCEPTED' ? 'primary' : 'danger'}
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

      {/* DETAILED REQUEST VIEW MODAL */}
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
              <label className="font-bold text-white">Rider Route Map</label>
              <Map
                origin={{ latitude: parseFloat(detailModalRequest.origin_lat || '31.2536'), longitude: parseFloat(detailModalRequest.origin_lng || '75.7037') }}
                destination={{ latitude: parseFloat(detailModalRequest.dest_lat || '31.3260'), longitude: parseFloat(detailModalRequest.dest_lng || '75.5762') }}
                height="260px"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-white/70">
              <div>Status: <strong className="text-white">{getMappedStatus(detailModalRequest.status)}</strong></div>
              <div>Seats on Ride: <strong className="text-white">{detailModalRequest.available_seats ?? '--'} remaining</strong></div>
              <div>Requested: <strong className="text-white">{formatDepartureTime(detailModalRequest.created_at)}</strong></div>
              <div>Departure: <strong className="text-white">{formatDepartureTime(detailModalRequest.departure_time)}</strong></div>
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
      </div>
    </WorkspaceLayout>
  );
}

export default function DriverRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading driver requests...</div>}>
      <DriverRequestsContent />
    </Suspense>
  );
}
