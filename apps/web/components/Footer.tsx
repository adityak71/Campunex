'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-[40px]">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 text-[13.5px] font-[700] text-white/50">
          <div>© {new Date().getFullYear()} Campunex — Unified Campus Ride-Matching</div>
          
          <div className="flex items-center gap-[14px] flex-wrap">
            <Link href="/dashboard" className="hover:text-white/82 transition-colors">Dashboard</Link>
            <Link href="/driver" className="hover:text-white/82 transition-colors">Driver</Link>
            <Link href="/admin" className="hover:text-white/82 transition-colors">Admin</Link>
            <Link href="/help" className="hover:text-white/82 transition-colors">Help</Link>
            <Link href="/safety" className="hover:text-white/82 transition-colors">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
