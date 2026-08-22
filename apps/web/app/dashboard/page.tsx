'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pickupName, setPickupName] = useState('LPU Main Gate');
  const [pickupLat, setPickupLat] = useState('31.2536');
  const [pickupLng, setPickupLng] = useState('75.7037');

  const [dropoffName, setDropoffName] = useState('Jalandhar City Railway Station');
  const [dropoffLat, setDropoffLat] = useState('31.3260');
  const [dropoffLng, setDropoffLng] = useState('75.5762');

  const [vehicleFilter, setVehicleFilter] = useState<'ALL' | 'CAR' | 'BIKE'>('ALL');

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
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Welcome Header */}
        <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300">
                Welcome back, {user?.name}! 👋
              </h1>
              <Badge variant={user?.verification_status === 'VERIFIED' ? 'verified' : 'warning'}>
                {user?.verification_status === 'VERIFIED' ? 'Verified Campus Member' : 'Pending Verification'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Campus Ride-Matching Platform • Smart 500m Route Proximity
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDriver ? (
              <Link href="/rides/create">
                <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Offer a Campus Ride
                </Button>
              </Link>
            ) : (
              <Link href="/rides/find">
                <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                  Find Rides Near You
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Quick Search Card for Riders */}
        {!isDriver && (
          <Card className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> Find Compatible Campus Rides
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setVehicleFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                    vehicleFilter === 'ALL'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All Rides
                </button>
                <button
                  onClick={() => setVehicleFilter('CAR')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition flex items-center gap-1 ${
                    vehicleFilter === 'CAR'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Car className="w-3 h-3" /> Car
                </button>
                <button
                  onClick={() => setVehicleFilter('BIKE')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition flex items-center gap-1 ${
                    vehicleFilter === 'BIKE'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Bike className="w-3 h-3" /> Bike
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocationPicker
                label="Pickup Landmark"
                placeholder="Select pickup address..."
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
                label="Destination Landmark"
                placeholder="Select destination address..."
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

            <div className="pt-2 flex justify-end">
              <Link
                href={`/rides/find?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&dest_lat=${dropoffLat}&dest_lng=${dropoffLng}`}
              >
                <Button variant="teal" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Search Matches Near 500m
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active / Requested Rides */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-cyan-300">
              {isDriver ? 'My Published Rides' : 'My Ride Requests'}
            </h2>

            {isDriver ? (
              myRides.length === 0 ? (
                <EmptyState
                  title="No active rides published"
                  description="Offer seats along your daily commute to help fellow students."
                  action={
                    <Link href="/rides/create">
                      <Button variant="primary" size="sm">Offer Ride</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {myRides.map((ride) => (
                    <Card key={ride.id} hoverable className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {ride.origin_name} ➔ {ride.destination_name}
                        </div>
                        <Badge variant="success">{ride.available_seats} Seats Left</Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Departure: {new Date(ride.departure_time).toLocaleString()}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <Link href={`/rides/requests?rideId=${ride.id}`}>
                          <Button variant="outline" size="sm">Manage Requests</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              myRequests.length === 0 ? (
                <EmptyState
                  title="No active ride requests"
                  description="Search available driver routes and request a seat."
                  action={
                    <Link href="/rides/find">
                      <Button variant="teal" size="sm">Find Rides</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => (
                    <Card key={req.id} hoverable className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {req.origin_name} ➔ {req.destination_name}
                        </div>
                        <Badge variant={req.status === 'ACCEPTED' ? 'success' : 'pending'}>
                          {req.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Driver: {req.driver_name}</div>
                      {req.trip_id && (
                        <div className="pt-2">
                          <Link href={`/trip/${req.trip_id}`}>
                            <Button variant="teal" size="sm" className="w-full">
                              Open Live Tracking
                            </Button>
                          </Link>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Quick Actions & Recent Log */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-cyan-300">Quick Actions & History</h2>
            <Card className="space-y-3 p-5">
              <Link href="/history" className="block">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>📜 View Full Trip History Log</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
              <Link href="/profile" className="block">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>👤 Campus Identity & Verification Profile</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
              <Link href="/safety" className="block">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>🛡️ Safety Center & OTP Guidelines</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
