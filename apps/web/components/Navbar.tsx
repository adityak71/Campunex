'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { User } from '@campunex/shared';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
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

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                C
              </div>
              <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                CAMPUNEX
              </span>
            </Link>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-cyan-400 border border-slate-700">
              500m PostGIS Match
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition ${
                    pathname === '/dashboard' ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>

                {user.role === 'DRIVER' ? (
                  <Link
                    href="/rides/create"
                    className="text-sm font-medium px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
                  >
                    + Publish Ride
                  </Link>
                ) : (
                  <Link
                    href="/rides/find"
                    className="text-sm font-medium px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
                  >
                    🔍 Find Ride
                  </Link>
                )}

                <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <span>{user.role}</span>
                      {user.verification_status === 'VERIFIED' ? (
                        <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
                      ) : (
                        <Link href="/verify" className="text-amber-400 underline font-semibold">
                          Verify Identity
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded border border-slate-800 hover:border-rose-900 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg transition shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
