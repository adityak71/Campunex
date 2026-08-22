'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import { formatDepartureTime } from '../../../lib/formatters';
import {
  Car,
  Bike,
  Navigation2,
  Clock,
  Users,
  Plus,
  ChevronRight,
  Calendar,
  AlertCircle,
  Activity,
  History
} from 'lucide-react';

const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes grace period for departure window

function getEffectiveRideStatus(ride: any): 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' {
  const status = (ride.status || '').toUpperCase();

  // Terminal & Active States (Never Overwrite!)
  if (status === 'COMPLETED') return 'COMPLETED';
  if (status === 'CANCELLED') return 'CANCELLED';
  if (status === 'ACTIVE' || status === 'IN_PROGRESS' || status === 'STARTED') return 'ACTIVE';
  if (status === 'EXPIRED') return 'EXPIRED';

  // For Unstarted Rides (SCHEDULED / OPEN):
  const depTime = new Date(ride.departure_time).getTime();
  const now = Date.now();

  if (depTime + GRACE_PERIOD_MS < now) {
    return 'EXPIRED';
  }

  return 'UPCOMING';
}

export default function DriverRidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [requestCounts, setRequestCounts] = useState<{ [rideId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab filter: UPCOMING | ACTIVE | COMPLETED | CANCELLED | EXPIRED
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'>('UPCOMING');

  const { showToast } = useToast();

  useEffect(() => {
    async function loadDriverRides() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiRequest('/rides/my-rides');
        const ridesList = res.rides || [];
        setRides(ridesList);

        // Fetch request counts for each ride
        const counts: { [rideId: string]: number } = {};
        for (const ride of ridesList) {
          try {
            const reqRes = await apiRequest(`/rides/${ride.id}/requests`);
            counts[ride.id] = reqRes.requests ? reqRes.requests.length : 0;
          } catch (e) {
            counts[ride.id] = 0;
          }
        }
        setRequestCounts(counts);
      } catch (err: any) {
        const msg = err.message || 'Failed to fetch published rides';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }

    loadDriverRides();
  }, []);

  const filteredRides = rides.filter((ride) => {
    const effectiveStatus = getEffectiveRideStatus(ride);
    return effectiveStatus === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Badge variant="info">DRIVER COMMUTE DASHBOARD</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              My Published Rides
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your published routes, inspect rider seat requests, and monitor trip status
            </p>
          </div>

          <Link href="/driver/offer">
            <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Offer a Campus Ride
            </Button>
          </Link>
        </div>

        {/* Filter Tabs (Upcoming, Active, Completed, Cancelled, Expired) */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  activeTab === tab
                    ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab === 'EXPIRED' ? 'EXPIRED (HISTORY)' : tab}
              </button>
            ))}
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : filteredRides.length === 0 ? (
          <EmptyState
            title={`No ${activeTab.toLowerCase()} rides found`}
            description="You currently have no published campus rides matching this tab filter."
            action={
              <Link href="/driver/offer">
                <Button variant="teal" size="sm">Offer Ride Now</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRides.map((ride) => {
              const effectiveStatus = getEffectiveRideStatus(ride);
              return (
                <Card key={ride.id} hoverable className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>{ride.origin_name} ➔ {ride.destination_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Departure: {formatDepartureTime(ride.departure_time)}</span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        effectiveStatus === 'COMPLETED'
                          ? 'success'
                          : effectiveStatus === 'ACTIVE'
                          ? 'info'
                          : effectiveStatus === 'CANCELLED' || effectiveStatus === 'EXPIRED'
                          ? 'danger'
                          : 'verified'
                      }
                    >
                      {effectiveStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>Vehicle: <strong>Campus Vehicle</strong></div>
                    <div>Available Seats: <strong className="text-teal-600 dark:text-teal-400">{ride.available_seats} / {ride.total_seats} Seats</strong></div>
                    <div>Passenger Requests: <strong className="text-[#1e3a8a] dark:text-cyan-400">{requestCounts[ride.id] || 0} Request(s)</strong></div>
                    <div>Proximity: <strong>500m Match Engine</strong></div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono text-[10px]">
                      Created: {formatDepartureTime(ride.created_at)}
                    </span>
                    <Link href={`/driver/rides/${ride.id}`}>
                      <Button variant="teal" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Manage Ride Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
