'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../lib/api';

export default function Footer() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          if (res?.user?.role) {
            setRole(res.user.role.toUpperCase());
          }
        })
        .catch(() => setRole(null));
    } else {
      setRole(null);
    }
  }, []);

  return (
    <footer className="py-[40px] border-t border-white/5 mt-auto">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 text-[13.5px] font-[700] text-white/50">
          <div>© {new Date().getFullYear()} Campunex — Unified Campus Ride-Matching</div>
          
          <div className="flex items-center gap-[14px] flex-wrap">
            {role === 'DRIVER' ? (
              <>
                <Link href="/driver" className="hover:text-accent1 transition-colors">Driver Home</Link>
                <Link href="/driver/rides" className="hover:text-white/82 transition-colors">My Rides</Link>
                <Link href="/driver/safety" className="hover:text-white/82 transition-colors">Driver Safety</Link>
              </>
            ) : role === 'ADMIN' ? (
              <>
                <Link href="/admin" className="hover:text-accent1 transition-colors">Admin Console</Link>
                <Link href="/admin/users" className="hover:text-white/82 transition-colors">User Management</Link>
              </>
            ) : role === 'RIDER' ? (
              <>
                <Link href="/dashboard" className="hover:text-accent1 transition-colors">Rider Dashboard</Link>
                <Link href="/rides/find" className="hover:text-white/82 transition-colors">Find Rides</Link>
                <Link href="/safety" className="hover:text-white/82 transition-colors">Safety</Link>
              </>
            ) : (
              <>
                <Link href="/" className="hover:text-white/82 transition-colors">Home</Link>
                <Link href="/how-it-works" className="hover:text-white/82 transition-colors">How it works</Link>
                <Link href="/safety" className="hover:text-white/82 transition-colors">Safety</Link>
              </>
            )}
            <Link href="/help" className="hover:text-white/82 transition-colors">Help</Link>
            <Link href="/contact" className="hover:text-white/82 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
