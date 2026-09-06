'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WorkspaceLayout from '../../components/layouts/WorkspaceLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../lib/api';
import { formatDepartureTime } from '../../lib/formatters';
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
    <WorkspaceLayout mode="rider" title="Trip History" subtitle="Review your past and upcoming commutes">
      <div className="space-y-6 w-full">
        

        {/* Filter Controls & Search */}
        <div className="bg-white/5 border border-white/10 rounded-[22px] p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    activeTab === tab
                      ? 'bg-white/5 text-white/80 border-white/10 shadow-sm'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <Input
                leftIcon={<Search className="w-4 h-4 text-white/40" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter route or participant..."
              />
            </div>
          </div>
        </div>

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
                <Button variant="primary" size="sm">Search Available Rides</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map((trip) => (
              <div 
                key={trip.id}
               
                className="bg-white/5 border border-white/10 rounded-[22px] p-5 flex flex-col justify-between space-y-4"
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
                    <span className="text-[10px] text-white/40 font-mono">
                      {formatDepartureTime(trip.created_at)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Navigation2 className="w-4 h-4 text-accent3 flex-shrink-0" />
                      <span>{trip.origin_name} ➔ {trip.destination_name}</span>
                    </div>
                  </div>

                  <div className="text-xs text-white/60 bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1">
                    <div>Driver: <strong>{trip.driver_name}</strong></div>
                    <div>Rider: <strong>{trip.rider_name}</strong></div>
                    {trip.completed_at && (
                      <div className="text-[10px] text-white/80 font-semibold mt-1">
                        ✓ Completed: {formatDepartureTime(trip.completed_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="text-xs text-white hover:underline font-bold flex items-center gap-1"
                  >
                    View Trip Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
