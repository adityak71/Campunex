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
          <div className="relative overflow-hidden p-6 border border-white/10 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl shadow-purple-950/20 group hover:border-accent1/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent1 to-purple-600 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Requests</div>
              <div className="p-2 bg-accent1/10 rounded-xl group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5 text-accent1" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {myRequests.length}
            </div>
            <p className="text-xs text-white/40 font-medium">Total bookings made</p>
          </div>

          <div className="relative overflow-hidden p-6 border border-white/10 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl shadow-purple-950/20 group hover:border-purple-400/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Upcoming</div>
              <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {upcomingRequest ? 1 : 0}
            </div>
            <p className="text-xs text-white/40 font-medium">Scheduled commutes</p>
          </div>

          <div className="relative overflow-hidden p-6 border border-white/10 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl shadow-purple-950/20 group hover:border-accent3/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-accent3 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Active</div>
              <div className="p-2 bg-accent3/10 rounded-xl group-hover:scale-110 transition-transform">
                <Navigation2 className="w-5 h-5 text-accent3" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {activeTrip ? 1 : 0}
            </div>
            <p className="text-xs text-white/40 font-medium">Live trip running</p>
          </div>

          <div className="relative overflow-hidden p-6 border border-white/10 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 shadow-xl shadow-purple-950/20 group hover:border-emerald-400/40 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Completed</div>
              <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-1">
              {myHistory.filter((t) => t.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-white/40 font-medium">Trips finished</p>
          </div>
        </div>

        {/* PRIMARY "FIND A RIDE" SEARCH CARD (RIDER FIRST MODEL) */}
        <form onSubmit={handleSearchSubmit}>
          <div className="relative overflow-hidden p-6 sm:p-8 transition-all duration-500 rounded-[28px] bg-gradient-to-br from-[#12121e]/95 via-[#151426]/95 to-[#181829]/95 border border-white/10 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl">
            {/* Ambient Purple Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent1/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent2/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-accent1/10 border border-accent1/20 text-accent1 shadow-sm">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white tracking-tight">
                      Find an Available Driver Ride
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5">
                      Search open driver routes passing within 500m of your pickup and destination
                    </p>
                  </div>
                </div>

                {/* Vehicle Selection Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('ANY')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'ANY'
                        ? 'bg-gradient-to-r from-accent1 to-purple-600 text-white border-purple-400/30 shadow-lg shadow-purple-950/50'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                    }`}
                  >
                    🚘 Any Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('CAR')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'CAR'
                        ? 'bg-gradient-to-r from-accent1 to-purple-600 text-white border-purple-400/30 shadow-lg shadow-purple-950/50'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <Car className="w-4 h-4" /> Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('BIKE')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                      vehicleFilter === 'BIKE'
                        ? 'bg-gradient-to-r from-accent1 to-purple-600 text-white border-purple-400/30 shadow-lg shadow-purple-950/50'
                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10'
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
                    <Calendar className="w-3.5 h-3.5 text-accent1" /> Commute Date
                  </label>
                  <input
                    type="date"
                    required
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-3.5 py-[12px] bg-[#090814]/80 border border-white/10 rounded-xl text-[13px] text-white/90 focus:outline-none focus:border-accent1/60 focus:ring-2 focus:ring-accent1/20 transition-all shadow-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[12px] font-[900] text-white/72 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent1" /> Time Window
                  </label>
                  <select
                    value={searchTimeWindow}
                    onChange={(e) => setSearchTimeWindow(e.target.value)}
                    className="w-full px-3.5 py-[12px] bg-[#090814]/80 border border-white/10 rounded-xl text-[13px] text-white/90 focus:outline-none focus:border-accent1/60 focus:ring-2 focus:ring-accent1/20 transition-all shadow-sm"
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
                  <Bookmark className="w-3.5 h-3.5 text-accent1" /> Popular Campus Landmark Shortcuts
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
                      className="px-3.5 py-2 bg-white/[0.04] hover:bg-accent1/15 text-white/75 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-accent1/30 flex items-center gap-1.5 shadow-sm"
                    >
                      <MapPin className="w-3 h-3 text-accent1" /> {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-accent1 via-purple-600 to-indigo-600 hover:from-accent1/90 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/60 hover:shadow-purple-900/80 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Find Rides</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ACTIVE & UPCOMING RIDES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Trip / Upcoming Booking Card */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-white">Active Trip & Upcoming Ride</h2>

            {activeTrip ? (
              <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 border border-accent1/40 shadow-xl shadow-purple-950/20 space-y-4 backdrop-blur-xl">
                <div className="flex justify-between items-start">
                  <Badge variant="info">LIVE TRIP IN PROGRESS</Badge>
                  <span className="text-xs font-mono font-bold text-accent1 animate-pulse">
                    📡 Active Room
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-accent1" />
                  <span>
                    {activeTrip.origin_name} ➔ {activeTrip.destination_name}
                  </span>
                </div>

                <Link href={`/trip/${activeTrip.trip_id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Open Live GPS Tracking Room
                  </Button>
                </Link>
              </div>
            ) : upcomingRequest ? (
              <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 border border-white/10 shadow-xl shadow-purple-950/20 space-y-4 backdrop-blur-xl">
                <div className="flex justify-between items-start">
                  <Badge variant="verified">UPCOMING BOOKING</Badge>
                  <span className="text-xs text-white/50">Scheduled Commute</span>
                </div>

                <div className="text-sm font-bold text-white">
                  {upcomingRequest.origin_name} ➔ {upcomingRequest.destination_name}
                </div>
                <div className="text-xs text-white/50">
                  Driver: <strong className="text-white/80">{upcomingRequest.driver_name}</strong>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-white/5">
                  <span className="text-xs text-white/40">Status: {upcomingRequest.status}</span>
                  <Link href="/rides/requests">
                    <Button variant="outline" size="sm">
                      View Booking Request
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No active or upcoming rides"
                description="Search available driver routes passing within 500m of your pickup."
                action={
                  <Link href="/rides/find">
                    <Button variant="primary" size="sm">
                      Find Rides
                    </Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Recent Trips Log Feed & Safety Access */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-white">Recent Trips & Safety Access</h2>

            <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#12121e]/90 to-[#181829]/90 border border-white/10 shadow-xl shadow-purple-950/20 space-y-4 backdrop-blur-xl">
              <div className="space-y-2">
                <div className="text-xs font-bold text-white/70">Recent Commutes History:</div>
                {myHistory.length === 0 ? (
                  <div className="text-xs text-white/40 p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                    No recent commute logs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myHistory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {item.origin_name} ➔ {item.destination_name}
                          </div>
                          <div className="text-[10px] text-white/50">Driver: {item.driver_name}</div>
                        </div>
                        <Badge variant="verified">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <Link href="/safety" className="block">
                  <div className="p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-xl transition flex justify-between items-center text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent1" /> Campus Safety Center & Dual OTP Rules
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </Link>

                <Link href="/help" className="block">
                  <div className="p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-xl transition flex justify-between items-center text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-accent3" /> Help Center & Support Guidelines
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
