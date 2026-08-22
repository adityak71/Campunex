'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Navigation2,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Hourglass
} from 'lucide-react';

export default function RiderRequestsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRiderRequests() {
      try {
        setLoading(true);
        setError(null);

        const meRes = await apiRequest('/auth/me');
        if (meRes.user?.role === 'DRIVER') {
          router.replace('/driver/requests');
          return;
        }

        const res = await apiRequest('/rides/requests/my-requests');
        setRequests(res.requests || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load your submitted ride requests');
      } finally {
        setLoading(false);
      }
    }

    loadRiderRequests();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Badge variant="info">RIDER SEAT RESERVATIONS</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              My Seat Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track seat booking requests submitted to campus drivers and monitor status updates
            </p>
          </div>

          <Link href="/rides/find">
            <Button variant="teal" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Find More Rides
            </Button>
          </Link>
        </div>

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

        {/* Main Content Hierarchy */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No seat requests submitted"
            description="You have not requested any seats on published driver rides yet. Search compatible routes to submit your first seat reservation."
            action={
              <Link href="/rides/find">
                <Button variant="teal" size="sm">Search Compatible Rides</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const status = (req.status || '').toUpperCase();
              const isAccepted = status === 'ACCEPTED';
              const isRejected = status === 'REJECTED';
              const isPending = status === 'REQUESTED' || status === 'PENDING';

              return (
                <Card key={req.id} hoverable className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span>{req.origin_name} ➔ {req.destination_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Driver: <strong>{req.driver_name || 'Campus Driver'}</strong></span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                        <span>Departure: {formatDepartureTime(req.departure_time)}</span>
                      </div>
                    </div>

                    <Badge
                      variant={isAccepted ? 'success' : isRejected ? 'danger' : 'warning'}
                    >
                      {isAccepted ? 'ACCEPTED' : isRejected ? 'DECLINED' : 'PENDING APPROVAL'}
                    </Badge>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Submitted: {new Date(req.created_at).toLocaleDateString()}
                    </span>

                    {isAccepted && (
                      <Link href={`/trip/${req.ride_id}`}>
                        <Button variant="teal" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          Open Live Trip Room
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
