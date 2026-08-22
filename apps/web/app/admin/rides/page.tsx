'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Activity, ShieldCheck } from 'lucide-react';

export default function AdminRidesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div>
          <Badge variant="info">LIVE MONITORING</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
            Active Ride Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time geospatial streams, WebSocket room tracking, and dual OTP trip completions
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          <Link href="/admin" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Dashboard
          </Link>
          <Link href="/admin/universities" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Universities
          </Link>
          <Link href="/admin/users" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Users
          </Link>
          <Link href="/admin/rides" className="px-3.5 py-2 bg-[#1e3a8a] text-white rounded-xl shadow-sm">
            Ride Monitoring
          </Link>
        </div>

        <Card className="p-6 space-y-4 text-center">
          <Activity className="w-8 h-8 text-teal-600 dark:text-cyan-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Live Geospatial Monitoring Active</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            All active rides are protected by PostGIS 500-meter proximity thresholding and real-time Socket.IO coordinate streaming.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
