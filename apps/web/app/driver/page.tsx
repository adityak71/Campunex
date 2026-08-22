'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ThemeToggle from '../../components/ThemeToggle';
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

export default function DriverDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Driver Availability State
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

        // Fetch requests for published rides
        let allRequests: any[] = [];
        for (const ride of processedRides) {
          try {
            const reqRes = await apiRequest(`/rides/${ride.id}/requests`);
            if (reqRes.requests) {
              allRequests = [...allRequests, ...reqRes.requests];
            }
          } catch (e) {
            // Ignore error for individual ride requests fetch
          }
        }
        setIncomingRequests(allRequests);

        // Fetch trip history log
        const historyRes = await apiRequest('/trips/history/my-history');
        setRecentHistory(historyRes.history || []);
      } catch (err: any) {
        const msg = err.message || 'Failed to load driver dashboard data';
        setError(msg);
        showToast(msg, 'error');
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

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    showToast('Signed out successfully', 'info');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
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
  const activeRides = myRides.filter((r) => r.status === 'OPEN' || r.status === 'SEAT_FULL' || r.status === 'ACTIVE');
  const pendingRequests = incomingRequests.filter((r) => r.status === 'REQUESTED');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Header Profile & Quick Action Bar */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] dark:bg-cyan-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'DR'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300">
                    Welcome back, {user?.name || 'Driver'}! 👋
                  </h1>
                  <Badge variant={user?.verification_status === 'VERIFIED' ? 'verified' : 'warning'}>
                    {user?.verification_status === 'VERIFIED' ? 'Verified Campus Driver' : 'Pending Verification'}
                  </Badge>
                </div>
                <p className="text-xs text-[#14b8a6] dark:text-cyan-300 font-bold">
                  You are sharing your route with verified campus riders.
                </p>
              </div>
            </div>

            {/* Quick Driver Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Link href="/driver/offer">
                <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  + Offer Ride
                </Button>
              </Link>
              <Link href="/driver/requests">
                <Button variant="outline" size="sm" leftIcon={<UserCheck className="w-4 h-4 text-teal-500" />}>
                  View Requests ({pendingRequests.length})
                </Button>
              </Link>
              <Link href="/driver/rides">
                <Button variant="outline" size="sm" leftIcon={<Car className="w-4 h-4 text-indigo-500" />}>
                  My Rides ({activeRides.length})
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Driver Availability Switch */}
        <Card className={`p-6 transition-all duration-300 border-2 ${
          isOnline
            ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-400/80 dark:border-teal-800'
            : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-teal-500 animate-ping' : 'bg-slate-400'}`} />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isOnline ? "You're available for compatible ride requests" : "You're currently offline"}
                </h2>
                <Badge variant={isOnline ? 'success' : 'default'}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isOnline
                  ? 'Your published driver routes are visible to campus riders within the 500m proximity engine.'
                  : 'Toggle online when you are ready to accept rider seat requests on your commute.'}
              </p>
            </div>

            <Button
              variant={isOnline ? 'danger' : 'teal'}
              size="md"
              onClick={toggleAvailability}
              leftIcon={<Power className="w-4 h-4" />}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </Card>

        {/* 4 Analytics Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2 border-l-4 border-l-teal-500">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Rides</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{activeRides.length}</div>
            <p className="text-[10px] text-slate-400">Active in route inventory</p>
          </Card>

          <Card className="p-4 space-y-2 border-l-4 border-l-amber-500">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Requests</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingRequests.length}</div>
            <p className="text-[10px] text-slate-400">Awaiting your approval</p>
          </Card>

          <Card className="p-4 space-y-2 border-l-4 border-l-indigo-500">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accepted Riders</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {incomingRequests.filter((r) => r.status === 'ACCEPTED').length}
            </div>
            <p className="text-[10px] text-slate-400">Confirmed seat bookings</p>
          </Card>

          <Card className="p-4 space-y-2 border-l-4 border-l-emerald-500">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Trips</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {recentHistory.filter((t) => t.status === 'COMPLETED').length}
            </div>
            <p className="text-[10px] text-slate-400">Logged in PostgreSQL</p>
          </Card>
        </div>

        {/* TODAY'S PUBLISHED RIDES INVENTORY */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
              <Car className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
              TODAY'S PUBLISHED DRIVER RIDES
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
                  <Button variant="teal" size="sm">+ Offer a Ride</Button>
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
                  <Card key={ride.id} className="p-5 space-y-4 hover:shadow-md transition border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-teal-500" />
                          {ride.origin_name} ➔ {ride.destination_name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Today • {new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <Badge variant={isFull ? 'danger' : 'success'}>
                        {isFull ? 'SEAT FULL' : 'OPEN'}
                      </Badge>
                    </div>

                    {/* Seat Capacity Bar */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Available Seat Capacity</span>
                        <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-teal-600 dark:text-cyan-400 font-extrabold'}>
                          {availableSeats} / {totalSeats} seats remaining
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${isFull ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: `${((totalSeats - availableSeats) / totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
      </main>

      <Footer />
    </div>
  );
}
