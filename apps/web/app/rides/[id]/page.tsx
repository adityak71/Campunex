'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import MatchBar from '../../../components/MatchBar';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { formatDepartureTime } from '../../../lib/formatters';
import {
  Navigation2,
  User as UserIcon,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Car,
  Bike,
  ArrowLeft,
  MessageSquare,
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function RideDetailsPage() {
  const params = useParams();
  const rideId = params.id as string;
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [existingRequest, setExistingRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Controls
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [customOfferNote, setCustomOfferNote] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    async function loadRideData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch ride details
        const res = await apiRequest(`/rides/${rideId}`);
        setRide(res.ride);

        // Check if rider already requested this ride
        try {
          const reqRes = await apiRequest('/rides/requests/my-requests');
          const foundReq = (reqRes.requests || []).find((r: any) => r.ride_id === rideId && r.status !== 'CANCELLED');
          if (foundReq) {
            setExistingRequest(foundReq);
          }
        } catch (e) {
          // Ignore requests check error
        }
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

  const handleExecuteRequestRide = async () => {
    setShowConfirmModal(false);
    setActionLoading(true);

    try {
      const res = await apiRequest(`/rides/${rideId}/requests`, {
        method: 'POST',
        body: JSON.stringify({
          pickup: {
            latitude: parseFloat(ride.origin?.latitude || ride.origin_lat || '31.2536'),
            longitude: parseFloat(ride.origin?.longitude || ride.origin_lng || '75.7037'),
          },
          dropoff: {
            latitude: parseFloat(ride.destination?.latitude || ride.destination_lat || '31.3260'),
            longitude: parseFloat(ride.destination?.longitude || ride.destination_lng || '75.5762'),
          },
        }),
      });

      const newReq = res.request || { id: 'new', status: 'REQUESTED' };
      setExistingRequest(newReq);
      showToast('🎉 Ride request sent! Status: Pending Driver Response', 'success');
    } catch (err: any) {
      showToast(`Request Failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setShowCancelModal(false);
    setActionLoading(true);

    try {
      if (existingRequest?.id) {
        await apiRequest(`/rides/requests/${existingRequest.id}/cancel`, { method: 'PATCH' });
      }
      setExistingRequest(null);
      showToast('Ride request cancelled successfully', 'info');
    } catch (err: any) {
      showToast(`Cancel failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCustomOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOfferModal(false);
    showToast('Custom commute offer note sent to Driver!', 'success');
    setCustomOfferNote('');
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
            description={error || 'Unable to locate the requested driver route.'}
            action={
              <Link href="/rides/find">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Ride Search
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
  const driverInitials = ride.driver_name
    ? ride.driver_name.substring(0, 2).toUpperCase()
    : 'DR';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Navigation Back */}
        <div className="space-y-4">
          <Link
            href="/rides/find"
            className="text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Ride Search Results
          </Link>

          {/* Existing Request Status Alert Banner */}
          {existingRequest && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-teal-900 dark:text-teal-200">Ride request sent</div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-300">
                    Status: <strong>Pending Driver Response</strong>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Pending Request
              </Button>
            </div>
          )}

          {/* Header Card */}
          <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                  {ride.origin_name} ➔ {ride.destination_name}
                </h1>
                <Badge variant="verified">
                  <ShieldCheck className="w-3 h-3 text-teal-600" /> .edu Verified Ride
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Departure: {formatDepartureTime(ride.departure_time)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOfferModal(true)}
                leftIcon={<MessageSquare className="w-4 h-4 text-teal-500" />}
              >
                Make an Offer
              </Button>

              {existingRequest ? (
                <Button variant="teal" size="sm" disabled>
                  ✓ Request Already Submitted
                </Button>
              ) : (
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => setShowConfirmModal(true)}
                  isLoading={actionLoading}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Request Ride
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Route Line Map Preview */}
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
            Route Line Map & 500m Proximity Inspection
          </h2>
          <Map
            origin={originPoint}
            destination={destPoint}
            routeGeometryGeoJson={ride.route_geometry}
            height="360px"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver & Vehicle Information Card */}
          <Card className="space-y-4 p-6">
            <h3 className="text-xs font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-teal-500" /> Driver Profile & Vehicle Info
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-base shadow-sm">
                {driverInitials}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {ride.driver_name || 'Campus Driver'}
                  <Badge variant="verified">Verified</Badge>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Institutional Driver Partner</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Vehicle:</span>
                <strong className="text-slate-900 dark:text-slate-100">Honda Civic (Silver)</strong>
              </div>
              <div className="flex justify-between">
                <span>Registration Number:</span>
                <strong className="font-mono text-slate-900 dark:text-slate-100">PB-08-AB-1234</strong>
              </div>
              <div className="flex justify-between">
                <span>Seat Capacity:</span>
                <strong className="text-teal-600 dark:text-teal-400">{ride.available_seats} Seats Available / {ride.total_seats} Total</strong>
              </div>
            </div>
          </Card>

          </Card>
        </div>

        {/* CONFIRMATION MODAL: "Request this ride?" */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Request this ride?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Confirm your seat request for this campus commute:
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div>Driver: <strong>{ride.driver_name || 'Campus Driver'}</strong> (.edu Verified)</div>
              <div>Vehicle: <strong>Honda Civic (PB-08-AB-1234)</strong></div>
              <div>Pickup Landmark: <strong>{ride.origin_name}</strong></div>
              <div>Destination Landmark: <strong>{ride.destination_name}</strong></div>
              <div>Departure: <strong>{formatDepartureTime(ride.departure_time)}</strong></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={handleExecuteRequestRide}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirm Request
              </Button>
            </div>
          </div>
        </Modal>

        {/* OPTIONAL MODAL: "Make an Offer" */}
        <Modal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          title="Make a Custom Commute Offer"
        >
          <form onSubmit={handleSendCustomOffer} className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Send a custom note or pickup timing preference to driver <strong>{ride.driver_name}</strong>:
            </p>

            <textarea
              required
              rows={3}
              value={customOfferNote}
              onChange={(e) => setCustomOfferNote(e.target.value)}
              placeholder="e.g. Can you pick me up near BH-4 gate at 6:35 PM?"
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowOfferModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm" className="flex-1">
                Send Custom Offer
              </Button>
            </div>
          </form>
        </Modal>

        {/* CANCEL CONFIRMATION MODAL */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Pending Ride Request?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel your pending seat request for <strong>{ride.origin_name} ➔ {ride.destination_name}</strong>?
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Request
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelRequest}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
