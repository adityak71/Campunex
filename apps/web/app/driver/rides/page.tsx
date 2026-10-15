'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
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
    <WorkspaceLayout
      mode="driver"
      title="My Published Rides"
      subtitle="Manage your published routes, inspect rider seat requests, and monitor trip status"
      actions={
        <Link href="/driver/offer">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Offer a Campus Ride
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 w-full">
        {/* Filter Tabs (Upcoming, Active, Completed, Cancelled, Expired) */}
        <div className="p-2 border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-md">
          <div className="flex flex-wrap gap-2">
            {(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  activeTab === tab
                    ? 'bg-accent1/20 text-white border-accent1/40 shadow-sm'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab === 'EXPIRED' ? 'EXPIRED (HISTORY)' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
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
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Offer Ride Now</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRides.map((ride) => {
              const effectiveStatus = getEffectiveRideStatus(ride);
              return (
                <div
                  key={ride.id}
                  className="p-6 space-y-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl hover:border-accent1/40 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-white flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-accent1 flex-shrink-0" />
                        <span>{ride.origin_name} ➔ {ride.destination_name}</span>
                      </div>
                      <div className="text-xs text-white/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white/40" />
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

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.04] p-3.5 rounded-xl border border-white/5 text-white/80">
                    <div>Vehicle: <strong className="text-white">Campus Vehicle</strong></div>
                    <div>Available Seats: <strong className="text-accent3">{ride.available_seats} / {ride.total_seats} Seats</strong></div>
                    <div>Passenger Requests: <strong className="text-accent1">{requestCounts[ride.id] || 0} Request(s)</strong></div>
                    <div>Proximity: <strong className="text-white/90">500m Match Engine</strong></div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-white/40 font-mono text-[11px]">
                      Created: {formatDepartureTime(ride.created_at)}
                    </span>
                    <Link href={`/driver/rides/${ride.id}`}>
                      <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Manage Ride Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
