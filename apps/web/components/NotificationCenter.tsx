'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Check, Trash2, X, ShieldAlert, Car, UserCheck, Settings, ChevronRight, Navigation2, ShieldCheck, Info } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { NotificationPayload } from '@campunex/shared';
import { SEED_RIDER_NOTIFICATIONS, SEED_DRIVER_NOTIFICATIONS, deduplicateNotifications, triggerNotificationToast } from '../lib/notifications';
import { getSocketClient } from '../lib/socket';
import { apiRequest } from '../lib/api';
import { useToast } from './ui/Toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isDriverRoute = pathname.startsWith('/driver');
  const roleContext = isDriverRoute ? 'DRIVER' : 'RIDER';

  const [notifications, setNotifications] = useState<NotificationPayload[]>(() =>
    deduplicateNotifications(isDriverRoute ? SEED_DRIVER_NOTIFICATIONS : SEED_RIDER_NOTIFICATIONS)
  );

  const { showToast } = useToast();

  // Load persistent notifications from API or fallback
  const fetchNotifications = async () => {
    try {
      const res = await apiRequest(`/notifications?role=${roleContext}`);
      if (res.notifications && Array.isArray(res.notifications)) {
        setNotifications(deduplicateNotifications(res.notifications));
      }
    } catch (err) {
      // Fallback to seed state if dev API is unseeded
      setNotifications((prev) =>
        deduplicateNotifications(prev.length > 0 ? prev : isDriverRoute ? SEED_DRIVER_NOTIFICATIONS : SEED_RIDER_NOTIFICATIONS)
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [roleContext, pathname]);

  // Real-time WebSocket listener with deduplication & noise prevention
  useEffect(() => {
    const socket = getSocketClient();

    const handleNewNotification = (data: NotificationPayload) => {
      // Ignore background GPS coordinates or WebSocket reconnect status
      if (data.type === 'GPS_UPDATE' || data.type === 'WEBSOCKET_RECONNECT') return;
      if (data.role !== roleContext && data.role !== 'BOTH') return;

      setNotifications((prev) => {
        if (prev.some((item) => item.id === data.id)) return prev;

        // Trigger single toast popup ONCE per unique event ID
        triggerNotificationToast(data, showToast);

        return [data, ...prev];
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [roleContext, showToast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist single read state server-side with optimistic update & revert on failure
  const markAsRead = async (id: string) => {
    const originalNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, state: 'READ' } : n))
    );

    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err: any) {
      setNotifications(originalNotifications);
      showToast('Failed to save read status on server', 'error');
    }
  };

  // Persist mark-all-read server-side
  const markAllAsRead = async () => {
    const originalNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, state: 'READ' })));

    try {
      await apiRequest(`/notifications/read-all?role=${roleContext}`, { method: 'PATCH' });
      showToast('All notifications marked as read', 'info');
    } catch (err: any) {
      setNotifications(originalNotifications);
      showToast('Failed to mark all as read on server', 'error');
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Silently handle delete fallback
    }
  };

  const getIcon = (category: NotificationPayload['category']) => {
    switch (category) {
      case 'REQUEST':
        return <UserCheck className="w-4 h-4 text-teal-600 dark:text-cyan-400" />;
      case 'RIDE':
        return <Car className="w-4 h-4 text-teal-500" />;
      case 'TRIP':
        return <Navigation2 className="w-4 h-4 text-emerald-500" />;
      case 'SAFETY':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[500] overflow-hidden text-xs">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
              <span className="font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                {isDriverRoute ? 'Driver Notifications' : 'Rider Notifications'}
              </span>
              {unreadCount > 0 && <Badge variant="warning">{unreadCount} New</Badge>}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-teal-600 dark:text-cyan-400 hover:underline font-bold"
              >
                Mark Read
              </button>
              <Link href="/settings/notifications" onClick={() => setIsOpen(false)}>
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Notification Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No notifications</div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) markAsRead(item.id);
                  }}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    !item.read ? 'bg-teal-50/40 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getIcon(item.category)}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.message}</p>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (!item.read) markAsRead(item.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:underline pt-1"
                      >
                        {item.action_label || 'View Details'} <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href={isDriverRoute ? '/driver/notifications' : '/notifications'}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 hover:underline flex items-center justify-center gap-1"
            >
              View Full {isDriverRoute ? 'Driver' : 'Rider'} Notification Center <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
