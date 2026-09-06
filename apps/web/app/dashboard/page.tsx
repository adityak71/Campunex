'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/Toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WorkspaceLayout from '../../components/layouts/WorkspaceLayout';
import LocationPicker from '../../components/LocationPicker';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { User } from '@campunex/shared';
import {
  Navigation2,
  Car,
  Bike,
  ShieldCheck,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  User as UserIcon,
  Calendar,
  MapPin,
  Bookmark,
  Shield,
  HelpCircle,
  Bell,
  ArrowRight
} from 'lucide-react';

const SAVED_LOCATIONS = [
  { name: 'LPU Main Gate', lat: '31.2536', lng: '75.7037' },
  { name: 'LPU Law Gate', lat: '31.2560', lng: '75.7010' },
  { name: 'Jalandhar City Railway Station', lat: '31.3260', lng: '75.5762' },
  { name: 'Phagwara Junction Railway Station', lat: '31.2240', lng: '75.7710' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Card State
  const [pickupName, setPickupName] = useState('LPU Main Gate');
  const [pickupLat, setPickupLat] = useState('31.2536');
  const [pickupLng, setPickupLng] = useState('75.7037');

  const [dropoffName, setDropoffName] = useState('Jalandhar City Railway Station');
  const [dropoffLat, setDropoffLat] = useState('31.3260');
  const [dropoffLng, setDropoffLng] = useState('75.5762');

  const [searchDate, setSearchDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTimeWindow, setSearchTimeWindow] = useState('ANY');
  const [vehicleFilter, setVehicleFilter] = useState<'ANY' | 'CAR' | 'BIKE'>('ANY');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const meRes = await apiRequest('/auth/me');
        if (meRes.user.role === 'DRIVER') {
          showToast('Access denied: Driver tools are at /driver', 'error');
          router.push('/driver');
          return;
        }
        setUser(meRes.user);

        if (meRes.user.role === 'DRIVER') {
          const driverRides = await apiRequest('/rides/my-rides');
          setMyRides(driverRides.rides || []);
        } else {
          const reqRes = await apiRequest('/rides/requests/my-requests');
          setMyRequests(reqRes.requests || []);

          try {
            const histRes = await apiRequest('/trips/history/my-history');
            setMyHistory(histRes.history || []);
          } catch (e) {
            setMyHistory([]);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      dest_lat: dropoffLat,
      dest_lng: dropoffLng,
      date: searchDate,
      time_window: searchTimeWindow,
      vehicle: vehicleFilter,
    }).toString();

    router.push(`/rides/find?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingRequest = myRequests.find((r) => r.status === 'ACCEPTED' || r.status === 'REQUESTED');
  const activeTrip = myRequests.find((r) => r.trip_id && ['STARTED', 'IN_PROGRESS', 'OTP_PENDING'].includes(r.status));

  return (
    <WorkspaceLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Rider'} 👋`}
      subtitle="Campunex Commute Engine • Drivers Publish Rides • Smart 500m Route Proximity Matching"
      mode="rider"
      actions={
        <div className="flex items-center gap-3">
          {user?.verification_status === 'VERIFIED' && (
            <Badge variant="verified">
              <ShieldCheck className="w-4 h-4 text-accent3" /> .edu Verified
            </Badge>
          )}
          <Link href="/rides/find">
            <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Browse Available Rides
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        
        {/* 4 Analytics Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-accent3/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-600 to-teal-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Requests</div>
              <div className="p-2 bg-teal-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5 text-accent3" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {myRequests.length}
            </div>
            <p className="text-xs text-white/40 font-medium">Total bookings made</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-indigo-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Upcoming</div>
              <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {upcomingRequest ? 1 : 0}
            </div>
            <p className="text-xs text-white/40 font-medium">Scheduled commutes</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-purple-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Active</div>
              <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Navigation2 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {activeTrip ? 1 : 0}
            </div>
            <p className="text-xs text-white/40 font-medium">Live trip running</p>
          </Card>

          <Card className="relative overflow-hidden p-6 border border-white/10 rounded-[28px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl group hover:border-fuchsia-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Completed</div>
              <div className="p-2 bg-fuchsia-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-fuchsia-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {myHistory.filter((t) => t.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-white/40 font-medium">Trips finished</p>
          </Card>
        </div>

        {/* PRIMARY "FIND A RIDE" SEARCH CARD (RIDER FIRST MODEL) */}
        <form onSubmit={handleSearchSubmit}>
          <Card className="relative overflow-hidden p-6 sm:p-8 transition-all duration-500 rounded-[32px] bg-white/5 border border-white/10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-accent3 dark:text-cyan-400" /> Find an Available Driver Ride
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Search open driver routes passing within 500m of your pickup and destination
                  </p>
                </div>

                {/* Vehicle Selection Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('ANY')}
                    className={`px-4 py-2 text-[13px] font-[800] rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'ANY'
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                        : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    🚘 Any Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('CAR')}
                    className={`px-4 py-2 text-[13px] font-[800] rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'CAR'
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                        : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <Car className="w-4 h-4" /> Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('BIKE')}
                    className={`px-4 py-2 text-[13px] font-[800] rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'BIKE'
                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                        : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <Bike className="w-4 h-4" /> Bike
                  </button>
                </div>
              </div>

              {/* Pickup & Destination Autocomplete Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LocationPicker
                  label="Pickup Origin Landmark"
                  placeholder="Type pickup landmark or gate..."
                  initialName={pickupName}
                  initialLat={pickupLat}
                  initialLng={pickupLng}
                  onSelectLocation={(name, lat, lng) => {
                    setPickupName(name);
                    setPickupLat(lat.toString());
                    setPickupLng(lng.toString());
                  }}
                />

                <LocationPicker
                  label="Dropoff Destination Landmark"
                  placeholder="Type destination landmark..."
                  initialName={dropoffName}
                  initialLat={dropoffLat}
                  initialLng={dropoffLng}
                  onSelectLocation={(name, lat, lng) => {
                    setDropoffName(name);
                    setDropoffLat(lat.toString());
                    setDropoffLng(lng.toString());
                  }}
                />
              </div>

              {/* Date & Time Window Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[12px] font-[900] text-white/72 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent3" /> Commute Date
                  </label>
                  <input
                    type="date"
                    required
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-3.5 py-[12px] bg-black/[0.18] border border-white/10 rounded-[14px] text-[13px] text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[12px] font-[900] text-white/72 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent3" /> Time Window
                  </label>
                  <select
                    value={searchTimeWindow}
                    onChange={(e) => setSearchTimeWindow(e.target.value)}
                    className="w-full px-3.5 py-[12px] bg-black/[0.18] border border-white/10 rounded-[14px] text-[13px] text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-sm"
                  >
                    <option value="ANY">Flexible / Any Time Today</option>
                    <option value="MORNING">Morning (6:00 AM - 12:00 PM)</option>
                    <option value="AFTERNOON">Afternoon (12:00 PM - 5:00 PM)</option>
                    <option value="EVENING">Evening (5:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Saved / Recent Campus Landmark Shortcuts */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="text-[11px] font-[800] text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-accent3/70" /> Popular Campus Landmark Shortcuts
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAVED_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setPickupName(loc.name);
                        setPickupLat(loc.lat);
                        setPickupLng(loc.lng);
                      }}
                      className="px-3 py-1.5 bg-black/20 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-[700] transition-all border border-white/5 hover:border-white/20 flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 opacity-70" /> {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Find Rides
                </Button>
              </div>
              </div>
            </Card>
          </form>
        
        {/* ACTIVE & UPCOMING RIDES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Trip / Upcoming Booking Card */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-white">
              Active Trip & Upcoming Ride
            </h2>

            {activeTrip ? (
              <Card className="p-5 border-2 border-accent3 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="info">LIVE TRIP IN PROGRESS</Badge>
                  <span className="text-xs font-mono font-bold text-accent3 dark:text-cyan-400 animate-pulse">
                    📡 Active Room
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-accent3" />
                  <span>{activeTrip.origin_name} ➔ {activeTrip.destination_name}</span>
                </div>

                <Link href={`/trip/${activeTrip.trip_id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Open Live GPS Tracking Room
                  </Button>
                </Link>
              </Card>
            ) : upcomingRequest ? (
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="success">UPCOMING BOOKING</Badge>
                  <span className="text-xs text-white/50">Scheduled Commute</span>
                </div>

                <div className="text-sm font-bold text-white">
                  {upcomingRequest.origin_name} ➔ {upcomingRequest.destination_name}
                </div>
                <div className="text-xs text-white/50">Driver: <strong>{upcomingRequest.driver_name}</strong></div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-white/40">Status: {upcomingRequest.status}</span>
                  <Link href={`/rides/requests`}>
                    <Button variant="outline" size="sm">View Booking Request</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <EmptyState
                title="No active or upcoming rides"
                description="Search available driver routes passing within 500m of your pickup."
                action={
                  <Link href="/rides/find">
                    <Button variant="primary" size="sm">Find Rides</Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Recent Trips Log Feed & Safety Access */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-white">
              Recent Trips & Safety Access
            </h2>

            <Card className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-white/70">Recent Commutes History:</div>
                {myHistory.length === 0 ? (
                  <div className="text-xs text-white/40 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                    No recent commute logs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myHistory.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{item.origin_name} ➔ {item.destination_name}</div>
                          <div className="text-[10px] text-white/50">Driver: {item.driver_name}</div>
                        </div>
                        <Badge variant="success">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link href="/safety" className="block">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent3" /> Campus Safety Center & Dual OTP Rules
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </Link>

                <Link href="/help" className="block">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-accent3" /> Help Center & Support Guidelines
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
