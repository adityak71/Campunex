'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import WorkspaceLayout from '../../components/layouts/WorkspaceLayout';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { User } from '@campunex/shared';
import {
  Car,
  Bike,
  Plus,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Navigation2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  AlertCircle,
  Power,
  Users,
  MapPin,
  Calendar,
  LogOut,
  History,
  UserCheck
} from 'lucide-react';
import { formatDepartureTime } from '../../lib/formatters';

export default function DriverDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Driver Availability State
  const [isOnline, setIsOnline] = useState(true);

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const savedOnline = localStorage.getItem('campunex_driver_online');
    if (savedOnline !== null) {
      setIsOnline(savedOnline === 'true');
    }

    async function loadDriverData() {
      try {
        setLoading(true);
        setError(null);

        const meRes = await apiRequest('/auth/me');
        if (meRes.user.role === 'RIDER') {
          showToast('Access denied: Rider tools are at /dashboard', 'error');
          router.push('/dashboard');
          return;
        }
        setUser(meRes.user);

        // Fetch driver rides
        const ridesRes = await apiRequest('/rides/my-rides');
        const ridesList = ridesRes.rides || [];

        // Filter and check expiration on past rides
        const now = new Date();
        const processedRides = ridesList.map((r: any) => {
          const depTime = new Date(r.departure_time);
          if (depTime < now && r.status === 'OPEN') {
            return { ...r, status: 'EXPIRED' };
          }
          return r;
        });

        setMyRides(processedRides);

        // Single canonical API call for driver ride requests
        try {
          const reqRes = await apiRequest('/rides/driver-requests');
          setIncomingRequests(reqRes.requests || []);
        } catch (e) {
          setIncomingRequests([]);
        }

        // Fetch trip history log
        try {
          const historyRes = await apiRequest('/trips/history/my-history');
          setRecentHistory(historyRes.history || []);
        } catch (e) {
          setRecentHistory([]);
        }
      } catch (err: any) {
        const msg = err.message || 'Failed to load driver dashboard data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadDriverData();
  }, []);

  const toggleAvailability = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    localStorage.setItem('campunex_driver_online', String(nextState));
    if (nextState) {
      showToast('⚡ You are now ONLINE — Available for 500m proximity ride requests.', 'success');
    } else {
      showToast('⏸️ You are now OFFLINE — Hidden from ride matching results.', 'info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  // Active / Upcoming / Expired filtering
  const activeRides = myRides.filter((r) => r.status === 'OPEN' || r.status === 'SCHEDULED' || r.status === 'SEAT_FULL' || r.status === 'ACTIVE');
  const pendingRequests = incomingRequests.filter((r) => r.status === 'REQUESTED' || r.status === 'PENDING');

  return (
    <WorkspaceLayout
      title="Driver Home"
      subtitle="Manage your rides, requests, and routes."
      mode="driver"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/driver/offer">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Offer Ride
            </Button>
          </Link>
          <Link href="/driver/requests">
            <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10" leftIcon={<UserCheck className="w-4 h-4 text-accent1" />}>
              Requests ({pendingRequests.length})
            </Button>
          </Link>
          <Link href="/driver/rides">
            <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10" leftIcon={<Car className="w-4 h-4 text-accent2" />}>
              My Rides ({activeRides.length})
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Error Alert */}
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

        {/* Driver Availability Switch */}
        {/* Driver Availability Switch */}
        <Card className={`relative overflow-hidden p-6 sm:p-8 transition-all duration-500 rounded-[32px] ${
          isOnline
            ? 'bg-gradient-to-r from-[#171033]/90 to-[#0d1633]/90 border border-indigo-500/30 shadow-[0_8px_32px_rgba(99,102,241,0.2)]'
            : 'bg-white/5 border border-white/10 shadow-lg'
        }`}>
          {isOnline && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[150%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          )}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className={`w-3.5 h-3.5 rounded-full z-10 ${isOnline ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]' : 'bg-white/30'}`} />
                  {isOnline && (
                    <span className="absolute w-5 h-5 rounded-full bg-indigo-400/40 animate-ping" />
                  )}
                </div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
                  {isOnline ? "You're available for compatible ride requests" : "You're currently offline"}
                </h2>
                <Badge variant={isOnline ? 'success' : 'default'} className={!isOnline ? 'bg-white/10 text-white/70 border-white/10' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-2xl font-medium">
                {isOnline
                  ? 'Your published driver routes are visible to campus riders within the 500m proximity engine. Stay alert for incoming requests.'
                  : 'Toggle online when you are ready to accept rider seat requests on your commute.'}
              </p>
            </div>

            <button
              onClick={toggleAvailability}
              className={`relative flex items-center p-1.5 w-[92px] h-[48px] rounded-full transition-all duration-500 focus:outline-none shrink-0 ${
                isOnline ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/10'
              }`}
              style={{
                boxShadow: isOnline ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.4)'
              }}
            >
              <motion.div
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg"
                layout
                animate={{
                  x: isOnline ? 44 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 25,
                }}
              >
                <Power className={`w-5 h-5 ${isOnline ? 'text-indigo-600' : 'text-white/40'}`} />
              </motion.div>
            </button>
          </div>
        </Card>

        {/* 4 Analytics Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-blue-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Open Rides</div>
              <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {activeRides.length}
            </div>
            <p className="text-xs text-white/40 font-medium">Active in route inventory</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-indigo-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Requests</div>
              <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-white/40 font-medium">Awaiting approval</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-purple-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Accepted</div>
              <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {incomingRequests.filter((r) => r.status === 'ACCEPTED').length}
            </div>
            <p className="text-xs text-white/40 font-medium">Confirmed bookings</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-fuchsia-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Completed</div>
              <div className="p-2 bg-fuchsia-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Navigation2 className="w-5 h-5 text-fuchsia-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {recentHistory.filter((t) => t.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-white/40 font-medium">Trips finished</p>
          </Card>
        </div>

        {/* TODAY'S PUBLISHED RIDES INVENTORY */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-white/40" />
              Today's Published Driver Rides
            </h2>
            <Link href="/driver/offer">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Publish New Route
              </Button>
            </Link>
          </div>

          {activeRides.length === 0 ? (
            <EmptyState
              title="No active driver rides for today"
              description="You have not published any routes for today. Offer a ride to start receiving rider seat requests."
              action={
                <Link href="/driver/offer">
                  <Button variant="teal" size="sm">Offer a Ride</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRides.map((ride) => {
                const availableSeats = ride.available_seats !== undefined ? ride.available_seats : 2;
                const totalSeats = ride.total_seats || 4;
                const isFull = availableSeats <= 0;

                return (
                  <Card key={ride.id} className="p-5 space-y-4 hover:shadow-md transition bg-[#12121e]/80 border-white/10 text-white rounded-[26px]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-extrabold text-base text-white/90 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-teal-400" />
                          {ride.origin_name} ➔ {ride.destination_name}
                        </div>
                        <div className="text-xs text-white/50 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-white/40" />
                          <span>Departure: {formatDepartureTime(ride.departure_time)}</span>
                        </div>
                      </div>

                      <Badge variant={isFull ? 'danger' : 'success'}>
                        {isFull ? 'SEAT FULL' : ride.status || 'OPEN'}
                      </Badge>
                    </div>

                    {/* Seat Capacity Bar */}
                    <div className="p-3 bg-white/5 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-white/60">Available Seat Capacity</span>
                        <span className={isFull ? 'text-rose-400 font-extrabold' : 'text-teal-400 font-extrabold'}>
                          {availableSeats} / {totalSeats} seats remaining
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${isFull ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: `${((totalSeats - availableSeats) / totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <Link href={`/driver/rides/${ride.id}`}>
                        <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          Manage Ride
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
      </div>
      </div>
    </WorkspaceLayout>
  );
}
