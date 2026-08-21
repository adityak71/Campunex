'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ShieldCheck, Lock, Wifi, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SafetyPage() {
  const safetyPillars = [
    {
      icon: UserCheck,
      title: 'University Identity Verification',
      desc: 'Only users with verified .edu or .in campus email domains can join and arrange rides within your community.',
    },
    {
      icon: Lock,
      title: 'Dual OTP Security System',
      desc: 'Ride initiation and completion require mutual 4-digit OTP verification hashes stored securely in Redis.',
    },
    {
      icon: Wifi,
      title: 'Live WebSocket GPS Tracking',
      desc: 'Driver location is streamed live during active trips so riders can follow coordinates on the map in real time.',
    },
    {
      icon: ShieldCheck,
      title: '500m PostGIS Spatial Boundaries',
      desc: 'Matching logic measures exact route overlap distances, ensuring drivers and riders meet within safe thresholds.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-teal-600 dark:text-cyan-400 uppercase tracking-widest bg-teal-50 dark:bg-cyan-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-cyan-800">
            SAFETY FIRST
          </span>
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Safety Center & Community Guidelines
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Built with rigorous cryptographic verification, live GPS streaming, and institutional identity verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safetyPillars.map(({ icon: Icon, title, desc }, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-3"
            >
              <div className="w-12 h-12 bg-teal-50 dark:bg-cyan-950/80 text-teal-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Community Safety Guidelines
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Never share your 4-digit OTP code before physically meeting your driver at the pickup point.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Verify driver identity and vehicle registration details matches your trip summary screen.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Report any suspicious behavior directly through the in-app support center.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
