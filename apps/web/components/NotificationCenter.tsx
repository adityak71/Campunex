'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Check, Trash2, X, ShieldAlert, Car, UserCheck, Settings, ChevronRight, Navigation2, ShieldCheck, Info } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { Notification } from '@campunex/shared';
import { getSocketClient } from '../lib/socket';
import { apiRequest } from '../lib/api';
import { useToast } from './ui/Toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest(`/notifications?limit=10`);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  useEffect(() => {
    const socket = getSocketClient();
    const handleNewNotification = (data: Notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === data.id)) return prev;
        showToast(data.title, 'info');
        setUnreadCount(c => c + 1);
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

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      showToast('Failed to save read status', 'error');
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      const deleted = notifications.find(n => n.id === id);
      if (deleted && !deleted.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const getIcon = (category: Notification['category']) => {
    switch (category) {
      case 'RIDE':
        return <Car className="w-5 h-5 text-teal-500" />;
      case 'TRIP':
        return <Navigation2 className="w-5 h-5 text-emerald-500" />;
      case 'SAFETY':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'ACCOUNT':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'REQUEST':
        return <UserCheck className="w-5 h-5 text-teal-600 dark:text-cyan-400" />;
      case 'SYSTEM':
      case 'ADMIN':
        return <Settings className="w-5 h-5 text-slate-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tooltip-trigger"
        title="Notifications"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="info" className="text-[10px] px-1.5 py-0">
                  {unreadCount} New
                </Badge>
              )}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 relative group ${
                      !notif.is_read ? 'bg-teal-50/30 dark:bg-slate-800/80' : 'bg-transparent'
                    }`}
                  >
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 dark:bg-cyan-500" />
                    )}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">{getIcon(notif.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className={`text-sm font-semibold truncate pr-4 ${!notif.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {notif.title}
                          </p>
                          {notif.priority === 'HIGH' || notif.priority === 'CRITICAL' ? (
                            <Badge variant={notif.priority === 'CRITICAL' ? 'danger' : 'warning'} className="text-[10px] scale-90 origin-top-right">
                              {notif.priority}
                            </Badge>
                          ) : null}
                        </div>
                        <p className={`text-xs line-clamp-2 ${!notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && (
                              <button onClick={(e) => markAsRead(notif.id, e)} className="p-1.5 text-teal-600 dark:text-cyan-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded" title="Mark as read">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={(e) => deleteNotification(notif.id, e)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded" title="Dismiss">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 z-0"
                        aria-label={notif.action_type || 'View Details'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <Link
              href={'/notifications'}
              onClick={() => setIsOpen(false)}
              className="flex justify-center items-center gap-1 w-full py-2 text-sm font-semibold text-teal-600 dark:text-cyan-400 hover:text-teal-700 dark:hover:text-cyan-300 transition"
            >
              View all notifications <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
