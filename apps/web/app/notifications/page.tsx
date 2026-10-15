'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkspaceLayout from '../../components/layouts/WorkspaceLayout';
import Button from '../../components/ui/Button';
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
  CheckCheck,
  Trash2,
  Settings,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<'RIDER' | 'DRIVER' | 'ADMIN'>('RIDER');
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>('ALL');

  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/notifications?limit=100`);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
      if (res.role) {
        setUserRole(res.role);
      }
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Also fetch current authenticated user profile to sync layout mode
    apiRequest('/auth/me')
      .then((res) => {
        if (res.user?.role) {
          setUserRole(res.user.role.toUpperCase());
        }
      })
      .catch(() => {});

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

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to dismiss all notifications?')) return;
    try {
      await apiRequest('/notifications/clear-all', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
      showToast('All notifications cleared', 'info');
    } catch (err) {
      showToast('Failed to clear notifications', 'error');
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
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      showToast('Notification dismissed', 'info');
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  // Role-adaptive tabs configuration
  const getTabsForRole = () => {
    if (userRole === 'DRIVER') {
      return [
        { id: 'ALL', label: 'All Alerts' },
        { id: 'UNREAD', label: `Unread (${unreadCount})` },
        { id: 'REQUESTS', label: 'Rider Requests' },
        { id: 'RIDES', label: 'My Rides' },
        { id: 'TRIPS', label: 'Active Trips' },
        { id: 'SAFETY', label: 'Safety & Account' },
      ];
    }
    if (userRole === 'ADMIN') {
      return [
        { id: 'ALL', label: 'All Platform Alerts' },
        { id: 'UNREAD', label: `Unread (${unreadCount})` },
        { id: 'SAFETY', label: 'Emergency SOS & Disputes' },
        { id: 'ACCOUNT', label: 'Identity Verifications' },
        { id: 'SYSTEM', label: 'System Health' },
      ];
    }
    // Default Rider Tabs
    return [
      { id: 'ALL', label: 'All Notifications' },
      { id: 'UNREAD', label: `Unread (${unreadCount})` },
      { id: 'RIDES', label: 'My Rides & Bookings' },
      { id: 'TRIPS', label: 'Active Trips' },
      { id: 'SAFETY', label: 'Security & Account' },
    ];
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'UNREAD') return !n.is_read;
    if (filterTab === 'REQUESTS') return n.category === 'REQUEST';
    if (filterTab === 'RIDES') return n.category === 'RIDE' || (userRole === 'RIDER' && n.category === 'REQUEST');
    if (filterTab === 'TRIPS') return n.category === 'TRIP';
    if (filterTab === 'SAFETY') return n.category === 'SAFETY' || (userRole !== 'ADMIN' && n.category === 'ACCOUNT');
    if (filterTab === 'ACCOUNT') return n.category === 'ACCOUNT';
    if (filterTab === 'SYSTEM') return n.category === 'SYSTEM' || n.category === 'ADMIN';
    return true;
  });

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge variant="danger" className="font-extrabold tracking-wide uppercase text-[10px]">
            CRITICAL
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge variant="warning" className="font-bold text-[10px]">
            HIGH
          </Badge>
        );
      case 'NORMAL':
        return (
          <Badge variant="info" className="text-[10px]">
            NORMAL
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-[10px]">
            LOW
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'RIDE':
        return <Car className="w-5 h-5 text-accent1" />;
      case 'REQUEST':
        return <UserCheck className="w-5 h-5 text-accent1" />;
      case 'TRIP':
        return <Navigation2 className="w-5 h-5 text-emerald-400" />;
      case 'SAFETY':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-5 h-5 text-accent3" />;
      case 'SYSTEM':
      case 'ADMIN':
        return <Settings className="w-5 h-5 text-white/50" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const layoutMode = (userRole?.toLowerCase() === 'driver'
    ? 'driver'
    : userRole?.toLowerCase() === 'admin'
    ? 'admin'
    : 'rider') as 'rider' | 'driver' | 'admin';

  return (
    <WorkspaceLayout
      mode={layoutMode}
      title="Notification Center"
      subtitle={`Strictly isolated updates for your ${userRole.toLowerCase()} account`}
    >
      <div className="space-y-6 w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#12121e]/90 to-[#181829]/90 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent1/10 border border-accent1/20 rounded-2xl">
                <Bell className="w-7 h-7 text-accent1" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">Notification Center</h1>
                  <Badge variant="default" className="text-[10px] uppercase font-bold border-white/10">
                    {userRole} FEED
                  </Badge>
                </div>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                  {userRole === 'DRIVER'
                    ? 'Manage incoming ride requests, seat bookings, and driving alerts'
                    : userRole === 'ADMIN'
                    ? 'Platform oversight, campus safety alerts, and university verifications'
                    : 'Personal ride requests, OTP verification prompts, and active commute tracking'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className="text-xs font-bold"
            >
              <CheckCheck className="w-4 h-4 mr-1.5 text-accent1" />
              Mark Read
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Role-Specific Filter Tabs */}
        <div className="bg-[#0e0d1a]/80 backdrop-blur-xl p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-white/10">
          {getTabsForRole().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                filterTab === tab.id
                  ? 'bg-gradient-to-r from-accent1 to-accent3 text-white shadow-lg shadow-purple-950/40'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-[#12121e]/80 border border-white/10 rounded-[20px] p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ))
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-12 h-12 text-accent1" />}
              title="You're all caught up!"
              description={`No notifications found under the "${filterTab}" filter.`}
            />
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-gradient-to-r ${
                  !notif.is_read
                    ? 'from-[#151426]/95 via-[#131222]/90 to-[#0e0d1a]/90 border-l-4 border-l-accent1 border-white/15 shadow-xl shadow-purple-950/20'
                    : 'from-[#0f0e1c]/70 to-[#0b0a16]/70 border-l-4 border-l-transparent border-white/5 opacity-80 hover:opacity-100'
                } border rounded-[20px] p-5 transition-all duration-200 group`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Category Badge Icon */}
                  <div className="flex-shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3
                        className={`text-sm font-bold truncate ${
                          !notif.is_read ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {getPriorityBadge(notif.priority)}
                      <span className="text-[10px] font-mono text-white/40 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        !notif.is_read ? 'text-white/80' : 'text-white/50'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions Button & Dismiss Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-0 justify-end">
                    {notif.action_url && notif.action_type && (
                      <Link href={notif.action_url} className="w-full sm:w-auto">
                        <Button
                          variant={notif.priority === 'CRITICAL' ? 'danger' : 'primary'}
                          size="sm"
                          className="w-full text-xs font-bold"
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                          }}
                        >
                          {notif.action_type.replace(/_/g, ' ')}
                        </Button>
                      </Link>
                    )}

                    {!notif.is_read && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="p-2 text-white/40 hover:text-accent1 hover:bg-white/5 rounded-xl transition"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
