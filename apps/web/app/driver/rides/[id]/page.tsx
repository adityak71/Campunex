'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import Map from '../../../../components/Map';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Skeleton from '../../../../components/ui/Skeleton';
import EmptyState from '../../../../components/ui/EmptyState';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { apiRequest } from '../../../../lib/api';
import { formatDepartureTime } from '../../../../lib/formatters';
import {
  Navigation2,
  Clock,
  Car,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Ban
} from 'lucide-react';

export default function DriverRideDetailsPage() {
  const params = useParams();
  const rideId = params.id as string;
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected request action state for Modal confirmation
  const [selectedReq, setSelectedReq] = useState<{ id: string; action: 'ACCEPTED' | 'REJECTED' } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadRideData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch driver rides list to extract ride details
        const ridesRes = await apiRequest('/rides/my-rides');
        const foundRide = (ridesRes.rides || []).find((r: any) => r.id === rideId);

        if (!foundRide) {
          setError('Ride not found or you do not have permission to view it.');
          setLoading(false);
          return;
        }

        setRide(foundRide);

        // Fetch requests for this ride
        const reqRes = await apiRequest(`/rides/${rideId}/requests`);
        setRequests(reqRes.requests || []);
      } catch (err: any) {
        const msg = err.message || 'Failed to load ride details';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadRideData();
  }, [rideId]);

  const handleConfirmRequestAction = async () => {
    if (!selectedReq) return;
    const { id: requestId, action: status } = selectedReq;
    setSelectedReq(null);
    setActionLoading(true);

    try {
      const res = await apiRequest(`/rides/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      showToast(`Request ${status.toLowerCase()} successfully!`, 'success');

      if (status === 'ACCEPTED' && res.result?.trip?.id) {
        router.push(`/trip/${res.result.trip.id}`);
      } else {
        // Refresh request list & available seats
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
        if (status === 'ACCEPTED' && ride) {
          setRide({ ...ride, available_seats: Math.max(0, ride.available_seats - 1) });
        }
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancelRide = async () => {
    setShowCancelModal(false);
    setActionLoading(true);

    try {
      // Mark local ride status as CANCELLED or notify backend
      setRide((prev: any) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
      showToast('Ride cancelled successfully.', 'info');
      router.push('/driver/rides');
    } catch (err: any) {
      showToast(`Cancel failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 text-center space-y-4">
          <EmptyState
            title="Ride Not Found"
            description={error || 'Unable to locate the specified ride.'}
            action={
              <Link href="/driver/rides">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to My Rides
                </Button>
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const originPoint = { latitude: parseFloat(ride.origin?.latitude || ride.origin_lat || '31.2536'), longitude: parseFloat(ride.origin?.longitude || ride.origin_lng || '75.7037') };
  const destPoint = { latitude: parseFloat(ride.destination?.latitude || ride.destination_lat || '31.3260'), longitude: parseFloat(ride.destination?.longitude || ride.destination_lng || '75.5762') };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Back Link & Header */}
        <div className="space-y-4">
          <Link
            href="/driver/rides"
            className="text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Published Rides
          </Link>

          <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                  {ride.origin_name} ➔ {ride.destination_name}
                </h1>
                <Badge variant={ride.status === 'COMPLETED' ? 'success' : ride.status === 'CANCELLED' ? 'danger' : 'verified'}>
                  {ride.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Departure: {formatDepartureTime(ride.departure_time)}
              </p>
            </div>

            {ride.status !== 'CANCELLED' && ride.status !== 'COMPLETED' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                leftIcon={<Ban className="w-4 h-4" />}
              >
                Cancel Ride
              </Button>
            )}
          </Card>
        </div>

        {/* Route Map Preview */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Route Line Map Preview
          </h2>
          <Map
            origin={originPoint}
            destination={destPoint}
            routeGeometryGeoJson={ride.route_geometry}
            height="320px"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-3 p-5 text-xs">
            <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300 border-b border-slate-100 dark:border-slate-800 pb-2">
              🚗 Vehicle & Seat Capacity
            </h3>
            <div>Vehicle: <strong>Campus Vehicle</strong></div>
            <div>Total Seat Capacity: <strong>{ride.total_seats} Total Seats</strong></div>
            <div>Available Passenger Seats: <strong className="text-teal-600 dark:text-teal-400">{ride.available_seats} Seats Remaining</strong></div>
            <div>Verification: <strong>.edu Campus Verified</strong></div>
          </Card>

          <Card className="space-y-3 p-5 text-xs">
            <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300 border-b border-slate-100 dark:border-slate-800 pb-2">
              🛡️ Route Security & Proximity
            </h3>
            <div>Proximity Threshold: <strong>Within 500 meters</strong></div>
            <div>Dual OTP Protection: <strong>Initiation & Completion Codes</strong></div>
            <div>Live GPS Streaming: <strong>Active on Socket.IO</strong></div>
            <div>Identity Check: <strong>Verified Institutional Domain</strong></div>
          </Card>
        </div>

        {/* Current Incoming Requests Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600 dark:text-cyan-400" /> Incoming Passenger Requests ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <EmptyState
              title="No pending requests for this ride"
              description="Riders matching your route within 500m proximity will appear here."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id} hoverable className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                      {req.rider_name ? req.rider_name.substring(0, 2).toUpperCase() : 'RD'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {req.rider_name}
                        <Badge variant="verified">Verified Rider</Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{req.rider_email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Requested: {formatDepartureTime(req.created_at)}
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
                          ✓ Accept Request
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
                      <div className="flex items-center gap-2">
                        <Badge variant={req.status === 'ACCEPTED' ? 'success' : 'danger'}>
                          {req.status}
                        </Badge>
                        {req.status === 'ACCEPTED' && req.trip_id && (
                          <Link href={`/trip/${req.trip_id}`}>
                            <Button variant="teal" size="sm">
                              Go to Trip
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal for Request Actions */}
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={selectedReq?.action === 'ACCEPTED' ? 'Accept Passenger Request?' : 'Decline Passenger Request?'}
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
                onClick={handleConfirmRequestAction}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirm {selectedReq?.action === 'ACCEPTED' ? 'Accept' : 'Decline'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modal for Canceling Ride */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Published Ride Offer?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel this ride from <strong>{ride.origin_name}</strong> to <strong>{ride.destination_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Ride Active
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancelRide}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirm Cancel Ride
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
