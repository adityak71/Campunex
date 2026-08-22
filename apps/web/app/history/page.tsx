'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { Navigation2, Calendar, Clock, CheckCircle2, ChevronRight, History, Search, Car } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await apiRequest('/trips/history/my-history');
        setHistory(res.history || []);
      } catch (err) {
        console.error('Failed to load trip history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter((trip) => {
    const matchesSearch =
      trip.origin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.rider_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'COMPLETED') return trip.status === 'COMPLETED';
    if (activeTab === 'ACTIVE') return ['STARTED', 'IN_PROGRESS', 'OTP_PENDING'].includes(trip.status);
    if (activeTab === 'UPCOMING') return trip.status === 'ACCEPTED';
    if (activeTab === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(trip.status);

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div className="space-y-1">
          <Badge variant="info">TRIP LOG & HISTORY</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Trip History Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Permanent transactional record of your campus trips stored in PostgreSQL
          </p>
        </div>

        {/* Filter Controls & Search */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    activeTab === tab
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter route or participant..."
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            title="No trips found"
            description="Your search or selected filter tab returned zero trip logs."
            action={
              <Link href="/rides/find">
                <Button variant="teal" size="sm">Search Available Rides</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map((trip) => (
              <Card
                key={trip.id}
                hoverable
                className="p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={
                        trip.status === 'COMPLETED'
                          ? 'success'
                          : ['STARTED', 'IN_PROGRESS'].includes(trip.status)
                          ? 'info'
                          : 'default'
                      }
                    >
                      {trip.status}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>{trip.origin_name} ➔ {trip.destination_name}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div>Driver: <strong>{trip.driver_name}</strong></div>
                    <div>Rider: <strong>{trip.rider_name}</strong></div>
                    {trip.completed_at && (
                      <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold mt-1">
                        ✓ Completed: {new Date(trip.completed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="text-xs text-[#1e3a8a] dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
                  >
                    View Trip Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
