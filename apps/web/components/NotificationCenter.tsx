'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  ShieldAlert,
  Car,
  UserCheck,
  Settings,
  ChevronRight,
  Navigation2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import Badge from './ui/Badge';
import { Notification } from '@campunex/shared';
import { getSocketClient } from '../lib/socket';
import { apiRequest } from '../lib/api';
import { useToast } from './ui/Toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRole, setCurrentRole] = useState<string>('RIDER');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/notifications?limit=10`);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
      if (res.role) {
        setCurrentRole(res.role);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;
    if (token) {
      fetchNotifications();
    }
  }, [pathname]);

  useEffect(() => {
    const socket = getSocketClient();
    const handleNewNotification = (data: Notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === data.id)) return prev;
        showToast(data.title, 'info');
        setUnreadCount((c) => c + 1);
        return [data, ...prev].slice(0, 10);
      });
    };
    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [showToast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      showToast('Failed to save read status', 'error');
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all read', 'error');
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      const deleted = notifications.find((n) => n.id === id);
      if (deleted && !deleted.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  const getIcon = (category: Notification['category']) => {
    switch (category) {
      case 'RIDE':
        return <Car className="w-4 h-4 text-accent1" />;
      case 'TRIP':
        return <Navigation2 className="w-4 h-4 text-emerald-400" />;
      case 'SAFETY':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-4 h-4 text-accent3" />;
      case 'REQUEST':
        return <UserCheck className="w-4 h-4 text-accent1" />;
      case 'SYSTEM':
      case 'ADMIN':
        return <Settings className="w-4 h-4 text-white/50" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-200"
        title="Notifications"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full border border-[#070611] shadow-lg shadow-rose-950/50 animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0c0b17]/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-purple-950/60 border border-white/10 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                Notifications
              </h3>
              <Badge variant="default" className="text-[10px] px-2 py-0.5 border-white/10">
                {currentRole === 'DRIVER' ? '🚗 Driver' : currentRole === 'ADMIN' ? '🛡️ Admin' : '👤 Rider'}
              </Badge>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold text-accent1 px-1.5 py-0.2 bg-accent1/10 rounded-full border border-accent1/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain divide-y divide-white/5">
            {loading ? (
              <div className="p-8 text-center text-white/40 text-xs">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40 flex flex-col items-center">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-2">
                  <Bell className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-xs font-semibold text-white/60">All caught up!</p>
                <p className="text-[11px] text-white/40 mt-1">No pending notifications for your account.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-all duration-200 cursor-pointer relative group flex gap-3 items-start ${
                    !notif.is_read
                      ? 'bg-gradient-to-r from-accent1/10 via-transparent to-transparent border-l-2 border-l-accent1 hover:bg-white/[0.06]'
                      : 'border-l-2 border-l-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Category Icon */}
                  <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10">
                    {getIcon(notif.category)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p
                        className={`text-xs font-bold truncate pr-2 ${
                          !notif.is_read ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        {notif.title}
                      </p>
                      {notif.priority === 'HIGH' || notif.priority === 'CRITICAL' ? (
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            notif.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {notif.priority}
                        </span>
                      ) : null}
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${!notif.is_read ? 'text-white/80' : 'text-white/50'}`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => markAsRead(notif.id, e)}
                            className="p-1 text-accent1 hover:bg-accent1/10 rounded transition"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteNotification(notif.id, e)}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02]">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex justify-center items-center gap-1.5 w-full py-2 text-xs font-bold text-accent1 hover:text-white transition group"
            >
              <span>Open Notification Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
