'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
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
    <WorkspaceLayout mode="rider" title="My Requests" subtitle="Track your ride requests and their status">
      <div className="space-y-6 w-full">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          

          <Link href="/rides/find">
            <Button variant="primary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
              Find More Rides
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/80 text-xs font-bold flex items-center justify-between">
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
                <Button variant="primary" size="sm">Search Compatible Rides</Button>
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
                <div  key={req.id} className="bg-white/5 border border-white/10 rounded-[22px] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-white flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-accent3 flex-shrink-0" />
                        <span>{req.origin_name} ➔ {req.destination_name}</span>
                      </div>
                      <div className="text-xs text-white/60 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-white/40" />
                        <span>Driver: <strong>{req.driver_name || 'Campus Driver'}</strong></span>
                        <Clock className="w-3.5 h-3.5 text-white/40 ml-2" />
                        <span>Departure: {formatDepartureTime(req.departure_time)}</span>
                      </div>
                    </div>

                    <Badge
                      variant={isAccepted ? 'success' : isRejected ? 'danger' : 'warning'}
                    >
                      {isAccepted ? 'ACCEPTED' : isRejected ? 'DECLINED' : 'PENDING APPROVAL'}
                    </Badge>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-white/10">
                    <span className="text-[10px] text-white/40 font-mono">
                      Submitted: {new Date(req.created_at).toLocaleDateString()}
                    </span>

                    {isAccepted && (
                      <Link href={req.trip_id ? `/trip/${req.trip_id}` : `/rides/requests`}>
                        <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          Open Live Trip Room
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
