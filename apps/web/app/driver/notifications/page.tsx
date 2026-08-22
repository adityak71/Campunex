'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { NotificationPayload, NotificationCategory } from '@campunex/shared';
import { SEED_DRIVER_NOTIFICATIONS, deduplicateNotifications } from '../../../lib/notifications';
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
  Search,
  ChevronRight,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export default function DriverNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>(
    deduplicateNotifications(SEED_DRIVER_NOTIFICATIONS)
  );
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'REQUEST' | 'TRIP' | 'SAFETY' | 'ACCOUNT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, state: 'READ' })));
    showToast('All driver notifications marked as read', 'info');
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read, state: !n.read ? 'READ' : 'UNREAD' } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification dismissed', 'info');
  };

  const filteredNotifications = notifications.filter((n) => {
    // Search query match
    if (
      searchQuery &&
      !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !n.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filterTab === 'UNREAD') return !n.read;
    if (filterTab === 'REQUEST') return n.category === 'REQUEST';
    if (filterTab === 'TRIP') return n.category === 'TRIP' || n.category === 'RIDE';
    if (filterTab === 'SAFETY') return n.category === 'SAFETY';
    if (filterTab === 'ACCOUNT') return n.category === 'ACCOUNT' || n.category === 'SYSTEM';

    return true;
  });

  const getPriorityBadge = (priority: NotificationPayload['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning" className="font-bold">HIGH</Badge>;
      case 'NORMAL':
        return <Badge variant="info">NORMAL</Badge>;
      default:
        return <Badge variant="default">LOW</Badge>;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'REQUEST':
        return <UserCheck className="w-5 h-5 text-teal-600 dark:text-cyan-400" />;
      case 'RIDE':
        return <Car className="w-5 h-5 text-teal-500" />;
      case 'TRIP':
        return <Navigation2 className="w-5 h-5 text-emerald-500" />;
      case 'SAFETY':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Badge variant="info">DRIVER NOTIFICATION CENTER</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              Driver Notifications & Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage incoming seat requests, trip status alerts, vehicle verifications, and safety advisories
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<Check className="w-4 h-4 text-teal-500" />}
            >
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'UNREAD', 'REQUEST', 'TRIP', 'SAFETY', 'ACCOUNT'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                    filterTab === tab
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All'
                    : tab === 'UNREAD'
                    ? `Unread (${unreadCount})`
                    : tab === 'REQUEST'
                    ? 'Requests'
                    : tab === 'TRIP'
                    ? 'Trips & Rides'
                    : tab === 'SAFETY'
                    ? 'Safety'
                    : 'Account'}
                </button>
              ))}
            </div>

            {/* Search Field */}
            <div className="w-full md:w-64">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver notifications..."
              />
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No driver notifications found"
            description="You have no notifications matching the selected filter or search query."
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
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h2>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
                      {getPriorityBadge(item.priority)}
                      {item.group_count && (
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] rounded-md">
                          Grouped ({item.group_count})
                        </span>
                      )}
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
                        {item.action_label || 'View Request'}
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
                    title="Dismiss Notification"
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
