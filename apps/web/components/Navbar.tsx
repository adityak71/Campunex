'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { User } from '@campunex/shared';
import { Navigation2, LogOut, Shield, Menu, X, Car, Search, PlusCircle, Bell, UserCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('campunex_token');
    if (token) {
      apiRequest('/auth/me')
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('campunex_token');
          setUser(null);
        });
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('campunex_token');
    setUser(null);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isDriverRole = user?.role === 'DRIVER';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={user ? (isDriverRole ? '/driver' : '/dashboard') : '/'}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-[#1e3a8a] dark:bg-cyan-600 rounded-lg flex items-center justify-center shadow-md">
            <Navigation2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg text-[#1e3a8a] dark:text-cyan-400 tracking-tight">
            Camp<span className="text-[#14b8a6] dark:text-cyan-300">unex</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] dark:bg-cyan-950/80 text-[#1e3a8a] dark:text-cyan-300 border border-[#bae6fd] dark:border-cyan-800">
            Verified Commute
          </span>
        </Link>

        {/* Desktop Links (Role Isolated Navigation) */}
        <div className="hidden md:flex items-center gap-1.5">
          {user ? (
            isDriverRole ? (
              /* DRIVER NAVIGATION BAR */
              <>
                <Link
                  href="/driver"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/driver'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Driver Dashboard
                </Link>
                <Link
                  href="/driver/offer"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    pathname === '/driver/offer' || pathname === '/rides/create'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  + Offer Ride
                </Link>
                <Link
                  href="/driver/rides"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/driver/rides'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  My Rides
                </Link>
                <Link
                  href="/driver/requests"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/driver/requests'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Requests
                </Link>
                <Link
                  href="/driver/history"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/driver/history'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  History
                </Link>
                <Link
                  href="/notifications"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/notifications'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Notifications
                </Link>
              </>
            ) : (
              /* RIDER NAVIGATION BAR */
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/dashboard'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/rides/find"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    pathname === '/rides/find' || pathname === '/rides/search'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  🔍 Find Ride
                </Link>
                <Link
                  href="/trips"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/trips' || pathname === '/history'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Trips
                </Link>
                <Link
                  href="/notifications"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/notifications'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Notifications
                </Link>
                <Link
                  href="/help"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    pathname === '/help'
                      ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Help
                </Link>
              </>
            )
          ) : (
            /* PUBLIC GUEST NAVIGATION */
            <>
              <Link
                href="/"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Home
              </Link>
              <Link
                href="/how-it-works"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                How It Works
              </Link>
              <Link
                href="/safety"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Safety
              </Link>
              <Link
                href="/help"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Help
              </Link>
              <Link
                href="/contact"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Contact
              </Link>
            </>
          )}
        </div>

        {/* User Status Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {user && <NotificationCenter />}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-100 dark:border-slate-800 pl-4">
              <Link href={isDriverRole ? '/driver/profile' : '/profile'} className="flex items-center gap-2 hover:opacity-90 transition">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                  {getInitials(user.name)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="font-semibold text-teal-600 dark:text-cyan-400">{user.role}</span>
                    {user.verification_status === 'VERIFIED' && (
                      <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 fill-teal-500" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[#1e3a8a] dark:bg-cyan-600 hover:bg-[#1d3271] dark:hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Role Isolated) */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-4 py-4 space-y-2">
          {user ? (
            <>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                  <div className="text-xs text-teal-600 dark:text-cyan-400 font-bold">{user.role} Account</div>
                </div>
              </div>

              {isDriverRole ? (
                /* DRIVER MOBILE LINKS */
                <>
                  <Link
                    href="/driver"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Driver Dashboard
                  </Link>
                  <Link
                    href="/driver/offer"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    + Offer Ride
                  </Link>
                  <Link
                    href="/driver/rides"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    My Rides
                  </Link>
                  <Link
                    href="/driver/requests"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Requests
                  </Link>
                  <Link
                    href="/driver/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/driver/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Profile & Vehicle
                  </Link>
                </>
              ) : (
                /* RIDER MOBILE LINKS */
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/rides/find"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    🔍 Find Ride
                  </Link>
                  <Link
                    href="/trips"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Trips
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Profile
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                How It Works
              </Link>
              <Link
                href="/safety"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Safety
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Help Center
              </Link>
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 bg-[#1e3a8a] dark:bg-cyan-600 text-white rounded-xl text-xs font-bold"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
