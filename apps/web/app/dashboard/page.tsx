'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
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

  const isDriver = user?.role === 'DRIVER';
  const upcomingRequest = myRequests.find((r) => r.status === 'ACCEPTED' || r.status === 'REQUESTED');
  const activeTrip = myRequests.find((r) => r.trip_id && ['STARTED', 'IN_PROGRESS', 'OTP_PENDING'].includes(r.status));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Welcome Greeting Header */}
        <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Welcome back, {user?.name}! 👋
              </h1>
              <Badge variant={user?.verification_status === 'VERIFIED' ? 'verified' : 'warning'}>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> .edu Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campunex Commute Engine • Drivers Publish Rides • Smart 500m Route Proximity Matching
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDriver ? (
              <Link href="/driver/offer">
                <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Offer a Campus Ride
                </Button>
              </Link>
            ) : (
              <Link href="/rides/find">
                <Button variant="teal" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                  Browse Available Rides
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* PRIMARY "FIND A RIDE" SEARCH CARD (RIDER FIRST MODEL) */}
        {!isDriver && (
          <form onSubmit={handleSearchSubmit}>
            <Card className="space-y-6 p-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
                    <Search className="w-5 h-5 text-teal-600 dark:text-cyan-400" /> Find an Available Driver Ride
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Search open driver routes passing within 500m of your pickup and destination
                  </p>
                </div>

                {/* Vehicle Selection Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('ANY')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                      vehicleFilter === 'ANY'
                        ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🚘 Any Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('CAR')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1 ${
                      vehicleFilter === 'CAR'
                        ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" /> Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleFilter('BIKE')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1 ${
                      vehicleFilter === 'BIKE'
                        ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" /> Bike
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" /> Commute Date
                  </label>
                  <input
                    type="date"
                    required
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-500" /> Time Window
                  </label>
                  <select
                    value={searchTimeWindow}
                    onChange={(e) => setSearchTimeWindow(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="ANY">Flexible / Any Time Today</option>
                    <option value="MORNING">Morning (6:00 AM - 12:00 PM)</option>
                    <option value="AFTERNOON">Afternoon (12:00 PM - 5:00 PM)</option>
                    <option value="EVENING">Evening (5:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Saved / Recent Campus Landmark Shortcuts */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-teal-500" /> Popular Campus Landmark Shortcuts:
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
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-cyan-950 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
                    >
                      📍 {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="teal" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Find Rides
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* ACTIVE & UPCOMING RIDES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Trip / Upcoming Booking Card */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-[#1e3a8a] dark:text-cyan-300">
              Active Trip & Upcoming Ride
            </h2>

            {activeTrip ? (
              <Card className="p-5 border-2 border-teal-500 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="info">LIVE TRIP IN PROGRESS</Badge>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-cyan-400 animate-pulse">
                    📡 Active Room
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Navigation2 className="w-4 h-4 text-teal-500" />
                  <span>{activeTrip.origin_name} ➔ {activeTrip.destination_name}</span>
                </div>

                <Link href={`/trip/${activeTrip.trip_id}`}>
                  <Button variant="teal" size="sm" className="w-full">
                    Open Live GPS Tracking Room
                  </Button>
                </Link>
              </Card>
            ) : upcomingRequest ? (
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="success">UPCOMING BOOKING</Badge>
                  <span className="text-xs text-slate-500">Scheduled Commute</span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {upcomingRequest.origin_name} ➔ {upcomingRequest.destination_name}
                </div>
                <div className="text-xs text-slate-500">Driver: <strong>{upcomingRequest.driver_name}</strong></div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Status: {upcomingRequest.status}</span>
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
                    <Button variant="teal" size="sm">Find Rides</Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Recent Trips Log Feed & Safety Access */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-[#1e3a8a] dark:text-cyan-300">
              Recent Trips & Safety Access
            </h2>

            <Card className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Recent Commutes History:</div>
                {myHistory.length === 0 ? (
                  <div className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                    No recent commute logs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myHistory.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.origin_name} ➔ {item.destination_name}</div>
                          <div className="text-[10px] text-slate-500">Driver: {item.driver_name}</div>
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
                      <Shield className="w-4 h-4 text-teal-600" /> Campus Safety Center & Dual OTP Rules
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link href="/help" className="block">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600" /> Help Center & Support Guidelines
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
