'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, X, ShieldAlert, Car, UserCheck, AlertTriangle } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

export interface NotificationItem {
  id: string;
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_DECLINED' | 'RIDE_REMINDER' | 'TRIP_STATUS' | 'SAFETY_ALERT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'NEW_REQUEST',
    title: 'New Passenger Request',
    message: 'A verified rider submitted a seat request for LPU Main Gate ➔ Jalandhar Station.',
    timestamp: '2 mins ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'REQUEST_ACCEPTED',
    title: 'Request Accepted',
    message: 'Seat reserved for Rider. Trip tracking room is active.',
    timestamp: '15 mins ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'RIDE_REMINDER',
    title: 'Upcoming Ride Reminder',
    message: 'Your scheduled departure from Campus Gate 1 is in 30 minutes.',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'SAFETY_ALERT',
    title: 'Campus Safety Check',
    message: 'Remember to verify the rider 4-digit OTP code before starting your journey.',
    timestamp: '3 hours ago',
    read: true,
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_REQUEST':
        return <Car className="w-4 h-4 text-teal-600 dark:text-cyan-400" />;
      case 'REQUEST_ACCEPTED':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'REQUEST_DECLINED':
        return <X className="w-4 h-4 text-rose-600" />;
      case 'SAFETY_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-teal-500" />;
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
              <span className="font-extrabold text-[#1e3a8a] dark:text-cyan-300">Driver Notifications</span>
              {unreadCount > 0 && <Badge variant="warning">{unreadCount} New</Badge>}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-teal-600 hover:underline font-bold"
              >
                Mark Read
              </button>
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
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition ${
                    !item.read ? 'bg-teal-50/40 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.message}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
