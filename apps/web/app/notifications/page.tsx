'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Car,
  Navigation2,
  ShieldCheck,
  ShieldAlert,
  Info,
  Clock,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export interface NotificationRecord {
  id: string;
  type:
    | 'NEW_COMPATIBLE_RIDE'
    | 'RIDE_REQUEST_ACCEPTED'
    | 'RIDE_REQUEST_DECLINED'
    | 'RIDE_CANCELLED'
    | 'DRIVER_APPROACHING'
    | 'TRIP_STARTING'
    | 'TRIP_COMPLETED'
    | 'VERIFICATION'
    | 'SAFETY'
    | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'n1',
    type: 'NEW_COMPATIBLE_RIDE',
    title: 'New Compatible Ride Published!',
    message: 'Driver Rahul Kumar published a route from LPU Main Gate ➔ Jalandhar Station matching your active alert.',
    link: '/rides/find',
    timestamp: '5 mins ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'RIDE_REQUEST_ACCEPTED',
    title: 'Ride Request Accepted',
    message: 'Your seat request for LPU Main Gate ➔ Jalandhar Station has been accepted by the driver.',
    link: '/rides/requests',
    timestamp: '25 mins ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'DRIVER_APPROACHING',
    title: 'Driver Approaching Pickup Point',
    message: 'Driver is within 500m of your pickup landmark (LPU Main Gate).',
    link: '/trip/t123',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'TRIP_STARTING',
    title: 'Trip Initiated — Start OTP Verified',
    message: 'Initiation OTP code verified. Your live GPS tracking room is now active.',
    link: '/trip/t123',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'TRIP_COMPLETED',
    title: 'Trip Completed Successfully',
    message: 'Completion OTP code verified. Commute transaction logged in PostgreSQL.',
    link: '/trip/t123/complete',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'VERIFICATION',
    title: 'Institutional Verification Confirmed',
    message: 'Your .edu campus domain credentials have been verified by administration.',
    link: '/profile',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'n7',
    type: 'SAFETY',
    title: 'Dual OTP Safety Advisory',
    message: 'Never share your 4-digit initiation OTP code before physically meeting your driver.',
    link: '/safety',
    timestamp: '3 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'RIDES' | 'SYSTEM'>('ALL');
  const { showToast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed', 'info');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'UNREAD') return !n.read;
    if (filterTab === 'RIDES')
      return [
        'NEW_COMPATIBLE_RIDE',
        'RIDE_REQUEST_ACCEPTED',
        'RIDE_REQUEST_DECLINED',
        'RIDE_CANCELLED',
        'DRIVER_APPROACHING',
        'TRIP_STARTING',
        'TRIP_COMPLETED',
      ].includes(n.type);
    if (filterTab === 'SYSTEM') return ['VERIFICATION', 'SAFETY', 'SYSTEM'].includes(n.type);
    return true;
  });

  const getNotificationIcon = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'NEW_COMPATIBLE_RIDE':
        return <Car className="w-5 h-5 text-teal-600 dark:text-cyan-400" />;
      case 'RIDE_REQUEST_ACCEPTED':
      case 'TRIP_COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'RIDE_REQUEST_DECLINED':
      case 'RIDE_CANCELLED':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'DRIVER_APPROACHING':
      case 'TRIP_STARTING':
        return <Navigation2 className="w-5 h-5 text-teal-500 animate-pulse" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'SAFETY':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Badge variant="info">COMMUTE NOTIFICATION CENTER</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              Notifications & Ride Alerts
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time updates for compatible open driver routes, seat request responses, and trip status changes
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<Check className="w-4 h-4 text-teal-500" />}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'UNREAD', 'RIDES', 'SYSTEM'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  filterTab === tab
                    ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab === 'ALL'
                  ? 'All Notifications'
                  : tab === 'UNREAD'
                  ? `Unread (${unreadCount})`
                  : tab === 'RIDES'
                  ? 'Ride Updates'
                  : 'System & Safety'}
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No notifications found"
            description="You are all caught up! Real-time alerts for matching driver routes and requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <Card
                key={item.id}
                className={`p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
                  !item.read
                    ? 'bg-teal-50/40 dark:bg-cyan-950/20 border-teal-200 dark:border-cyan-800/60 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex-shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                      {item.message}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      {item.timestamp}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {item.link && (
                    <Link href={item.link}>
                      <Button variant="teal" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleReadStatus(item.id)}
                    className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold"
                    title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    {item.read ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
