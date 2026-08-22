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
  Search,
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
  Sliders,
  History,
  Home,
  MessageSquare
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
    // Load initial online state from localStorage if available
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
        setMyRides(ridesList);

        // Fetch requests for published rides
        let allRequests: any[] = [];
        for (const ride of ridesList) {
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

  // Find any active trip currently in progress
  const activeTrip = recentHistory.find((t) =>
    ['ACCEPTED', 'OTP_PENDING', 'STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(t.status)
  );

  const pendingRequestsCount = incomingRequests.filter((r) => r.status === 'REQUESTED').length;
  const upcomingRidesCount = myRides.filter((r) => r.status === 'OPEN').length;
  const completedRidesCount = recentHistory.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* 1. Header Profile & Quick Action Bar */}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Campus Driver Control Center • Verified Commute & 500m Route Proximity
                </p>
              </div>
            </div>

            {/* Header Right Actions (Notification Bell, Theme, Profile Dropdown) */}
            <div className="flex items-center gap-3 relative">
              <ThemeToggle />

              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
                      <span>Driver Notifications</span>
                      <Badge variant="info">{pendingRequestsCount} Pending</Badge>
                    </div>
                    {pendingRequestsCount === 0 ? (
                      <div className="text-slate-400 text-center py-3 text-[11px]">No unread ride requests</div>
                    ) : (
                      incomingRequests
                        .filter((r) => r.status === 'REQUESTED')
                        .map((req) => (
                          <Link
                            key={req.id}
                            href={`/driver/requests`}
                            onClick={() => setNotificationsOpen(false)}
                            className="block p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition space-y-1"
                          >
                            <div className="font-bold text-slate-900 dark:text-slate-100">{req.rider_name} requested a seat</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{req.origin_name} ➔ {req.destination_name}</div>
                          </Link>
                        ))
                    )}
                  </div>
                )}
              </div>

              {/* Profile Shortcut Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Profile Menu"
                >
                  <UserIcon className="w-4 h-4" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold transition"
                    >
                      👤 Driver Profile & Credentials
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold transition"
                    >
                      📜 Trip History Log
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Driver Availability Switch */}
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

            <button
              onClick={toggleAvailability}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 flex items-center gap-2 shadow-sm ${
                isOnline
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
                  : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'Switch to Offline' : 'Go Online Now'}</span>
            </button>
          </div>
        </Card>

        {/* 3. Quick Actions Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/driver/offer">
            <Card hoverable className="p-5 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border-teal-200 dark:border-teal-800">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Offer a Campus Ride
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Publish your route & available seats</p>
              </div>
              <ChevronRight className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            </Card>
          </Link>

          <Link href="/driver/requests">
            <Card hoverable className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Incoming Requests
                  {pendingRequestsCount > 0 && (
                    <Badge variant="warning">{pendingRequestsCount}</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Review & accept rider bookings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Card>
          </Link>

          <Link href={activeTrip ? `/trip/${activeTrip.id}` : '/history'}>
            <Card hoverable className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Active Trip Tracking
                  {activeTrip && <Badge variant="info">In Progress</Badge>}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Live GPS & Dual OTP verification</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Card>
          </Link>
        </div>

        {/* 4. Overview Cards (4 Key Metrics) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Upcoming Rides</span>
              <Car className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{upcomingRidesCount}</div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Published & Open</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Pending Requests</span>
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{pendingRequestsCount}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Awaiting Acceptance</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Active Trip</span>
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeTrip ? '1' : '0'}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              {activeTrip ? 'Live Room Open' : 'No Active Room'}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Completed Rides</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{completedRidesCount}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Total Logged Trips</div>
          </Card>
        </div>

        {/* 5. Today's Rides Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-cyan-400" /> Today's Driver Rides
            </h2>
            <Link href="/driver/offer">
              <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Offer New Ride
              </Button>
            </Link>
          </div>

          {myRides.length === 0 ? (
            <EmptyState
              title="No driver rides published today"
              description="Offer seats along your daily campus commute to help fellow students."
              action={
                <Link href="/driver/offer">
                  <Button variant="primary" size="sm">Offer Ride Now</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myRides.map((ride) => (
                <Card key={ride.id} hoverable className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>{ride.origin_name} ➔ {ride.destination_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Departure: {new Date(ride.departure_time).toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant={ride.available_seats > 0 ? 'success' : 'danger'}>
                      {ride.available_seats} Seats Available
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>Vehicle: <strong>Campus Vehicle</strong></div>
                    <div>Seat Capacity: <strong>{ride.total_seats} Total Seats</strong></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Status: <strong className="text-teal-600 dark:text-teal-400">{ride.status}</strong>
                    </span>
                    <Link href={`/driver/requests?rideId=${ride.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                        Manage Requests
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 6. Recent Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600 dark:text-cyan-400" /> Recent Activity & Updates
          </h2>

          <Card className="p-5 space-y-3">
            {recentHistory.length === 0 && incomingRequests.length === 0 ? (
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                No recent activity logged yet. Published rides and incoming requests will appear here in real-time.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {incomingRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                        {req.rider_name ? req.rider_name.substring(0, 2).toUpperCase() : 'RD'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {req.rider_name} requested a seat on your ride
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {req.origin_name} ➔ {req.destination_name}
                        </div>
                      </div>
                    </div>
                    <Badge variant={req.status === 'ACCEPTED' ? 'success' : 'pending'}>
                      {req.status}
                    </Badge>
                  </div>
                ))}

                {recentHistory.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {trip.rider_name ? trip.rider_name.substring(0, 2).toUpperCase() : 'TR'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          Trip with {trip.rider_name} ({trip.status})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {trip.origin_name} ➔ {trip.destination_name}
                        </div>
                      </div>
                    </div>
                    <Badge variant={trip.status === 'COMPLETED' ? 'success' : 'info'}>
                      {trip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* 9. Responsive Mobile Driver Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 flex justify-around items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-lg">
        <Link href="/driver" className="flex flex-col items-center gap-1 text-[#1e3a8a] dark:text-cyan-400">
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link href="/driver/requests" className="flex flex-col items-center gap-1 hover:text-teal-600 dark:hover:text-cyan-400 relative">
          <Users className="w-5 h-5" />
          <span>Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 right-2 w-3 h-3 bg-rose-500 text-white rounded-full text-[8px] flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </Link>
        <Link href={activeTrip ? `/trip/${activeTrip.id}` : '/driver/rides'} className="flex flex-col items-center gap-1 hover:text-teal-600 dark:hover:text-cyan-400">
          <Activity className="w-5 h-5" />
          <span>Active</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center gap-1 hover:text-teal-600 dark:hover:text-cyan-400">
          <History className="w-5 h-5" />
          <span>History</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-teal-600 dark:hover:text-cyan-400">
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
