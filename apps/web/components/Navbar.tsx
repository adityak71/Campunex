'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { User } from '@campunex/shared';
import { Navigation2, LogOut, Shield, History, User as UserIcon, ShieldAlert } from 'lucide-react';

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

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center shadow-md">
            <Navigation2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg text-[#1e3a8a] tracking-tight">
            Camp<span className="text-[#14b8a6]">unex</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#1e3a8a] border border-[#bae6fd]">
            500m PostGIS
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  pathname === '/dashboard'
                    ? 'bg-[#e0f2fe] text-[#1e3a8a]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'DRIVER' ? (
                <Link
                  href="/rides/create"
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                    pathname === '/rides/create'
                      ? 'bg-[#e0f2fe] text-[#1e3a8a]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'
                  }`}
                >
                  + Offer Ride
                </Link>
              ) : (
                <Link
                  href="/rides/find"
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                    pathname === '/rides/find'
                      ? 'bg-[#e0f2fe] text-[#1e3a8a]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'
                  }`}
                >
                  🔍 Find Ride
                </Link>
              )}

              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  pathname === '/history'
                    ? 'bg-[#e0f2fe] text-[#1e3a8a]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'
                }`}
              >
                History
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                    pathname === '/admin'
                      ? 'bg-[#e0f2fe] text-[#1e3a8a]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'
                  }`}
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/"
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                href="/rides/find"
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50"
              >
                Explore Rides
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50"
              >
                Admin Panel
              </Link>
            </>
          )}
        </div>

        {/* User Status Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-90 transition">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {getInitials(user.name)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="font-semibold">{user.role}</span>
                    {user.verification_status === 'VERIFIED' ? (
                      <span className="text-teal-600 font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 fill-teal-500" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold underline">
                        Verify
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#1d3271] text-white text-sm font-semibold rounded-xl transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
