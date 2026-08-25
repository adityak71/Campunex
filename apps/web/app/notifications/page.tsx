'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { Notification, NotificationCategory } from '@campunex/shared';
import { apiRequest } from '../../lib/api';
import {
  Bell,
  Car,
  Navigation2,
  ShieldCheck,
  ShieldAlert,
  Info,
  Clock,
  Check,
  Trash2,
  Settings
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'RIDE' | 'ACCOUNT' | 'SYSTEM'>('ALL');
  
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/notifications`);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      showToast('Failed to update notification', 'error');
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      const deleted = notifications.find(n => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      showToast('Notification dismissed', 'info');
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'UNREAD') return !n.is_read;
    if (filterTab === 'RIDE') return n.category === 'RIDE' || n.category === 'TRIP' || n.category === 'REQUEST';
    if (filterTab === 'ACCOUNT') return n.category === 'ACCOUNT' || n.category === 'SAFETY';
    if (filterTab === 'SYSTEM') return n.category === 'SYSTEM' || n.category === 'ADMIN';
    return true;
  });

  const getPriorityBadge = (priority: Notification['priority']) => {
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
      case 'RIDE':
      case 'REQUEST':
        return <Car className="w-5 h-5 text-teal-600 dark:text-cyan-400" />;
      case 'TRIP':
        return <Navigation2 className="w-5 h-5 text-emerald-500" />;
      case 'SAFETY':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'SYSTEM':
      case 'ADMIN':
        return <Settings className="w-5 h-5 text-slate-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: `Unread (${unreadCount})` },
    { id: 'RIDE', label: 'Rides' },
    { id: 'ACCOUNT', label: 'Account' },
    { id: 'SYSTEM', label: 'System' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-teal-600 dark:text-cyan-400" />
              Notification Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
              Stay updated on your rides, security alerts, and system announcements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0 || loading}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl flex flex-wrap gap-1 mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                filterTab === tab.id
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-12 h-12" />}
              title="You're all caught up!"
              description="No notifications to show for this filter."
            />
          ) : (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`overflow-hidden transition-all duration-300 ${
                  !notif.is_read
                    ? 'border-l-4 border-l-teal-500 dark:border-l-cyan-500 bg-white dark:bg-slate-800 shadow-md'
                    : 'border-l-4 border-l-transparent bg-slate-50 dark:bg-slate-900/50 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-shrink-0 p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(notif.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`text-base font-bold truncate ${!notif.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h3>
                      {getPriorityBadge(notif.priority)}
                    </div>
                    <p className={`text-sm mb-2 ${!notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0 justify-end">
                    {notif.action_url && notif.action_type && (
                      <Link href={notif.action_url} className="w-full sm:w-auto">
                        <Button variant={notif.priority === 'HIGH' || notif.priority === 'CRITICAL' ? 'primary' : 'outline'} size="sm" className="w-full">
                          {notif.action_type.replace(/_/g, ' ')}
                        </Button>
                      </Link>
                    )}
                    
                    {!notif.is_read && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 transition-colors tooltip-trigger"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors tooltip-trigger"
                      title="Dismiss"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
