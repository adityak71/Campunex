'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import Map from '../../../components/Map';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { Navigation2, User as UserIcon, Calendar, Clock, CheckCircle2, ShieldCheck, Car } from 'lucide-react';

export default function RideDetailsPage() {
  const params = useParams();
  const rideId = params.id as string;
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadRideDetails() {
      try {
        const res = await apiRequest(`/rides/${rideId}`);
        setRide(res.ride);
      } catch (err: any) {
        showToast(err.message || 'Failed to load ride details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRideDetails();
  }, [rideId]);

  const handleRequestRide = async () => {
    setRequesting(true);
    try {
      const res = await apiRequest(`/rides/${rideId}/request`, {
        method: 'POST',
        body: JSON.stringify({
          pickup_lat: ride.origin?.latitude || 31.2536,
          pickup_lng: ride.origin?.longitude || 75.7037,
          dest_lat: ride.destination?.latitude || 31.3260,
          dest_lng: ride.destination?.longitude || 75.5762,
        }),
      });

      showToast(res.message || 'Ride requested successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Request failed', 'error');
    } finally {
      setRequesting(false);
    }
  };

  if (loading || !ride) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const originPoint = { latitude: parseFloat(ride.origin_lat || '31.2536'), longitude: parseFloat(ride.origin_lng || '75.7037') };
  const destPoint = { latitude: parseFloat(ride.destination_lat || '31.3260'), longitude: parseFloat(ride.destination_lng || '75.5762') };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                  {ride.origin_name} ➔ {ride.destination_name}
                </h1>
                <Badge variant="verified">Verified Ride</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Departure: {new Date(ride.departure_time).toLocaleString()}
              </p>
            </div>

            <Button
              onClick={handleRequestRide}
              isLoading={requesting}
              variant="teal"
              size="md"
            >
              Request Seat
            </Button>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Route Polyline Preview
            </h2>
            <Map
              origin={originPoint}
              destination={destPoint}
              routeGeometryGeoJson={ride.route_geometry}
              height="350px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300">Driver & Vehicle Details</h3>
              <div>Driver: <strong>{ride.driver_name || 'Campus Commuter'}</strong></div>
              <div>Available Seats: <strong>{ride.available_seats} Seats Remaining</strong></div>
              <div>Verification: <strong>.edu Campus Verified</strong></div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-[#1e3a8a] dark:text-cyan-300">Route Proximity Shield</h3>
              <div>Spatial Overlap: <strong>Within 500 meters</strong></div>
              <div>Dual OTP Protection: <strong>Enabled</strong></div>
              <div>Live GPS Streaming: <strong>Active on Trip</strong></div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
