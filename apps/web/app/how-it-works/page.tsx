'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { UserCheck, MapPin, Users, Navigation2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      icon: UserCheck,
      title: 'Verify University Identity',
      desc: 'Confirm your account with your official university email (.edu or .in). Every member is verified before making or accepting rides.',
    },
    {
      step: '02',
      icon: MapPin,
      title: 'Enter Route & Schedule',
      desc: 'Set your daily pickup landmark and destination. Our real-time address geocoding resolves coordinates into PostGIS geometries.',
    },
    {
      step: '03',
      icon: Users,
      title: '500m PostGIS Route Match',
      desc: 'Our spatial algorithm evaluates route line overlaps within a 500-meter threshold, ranking drivers by match compatibility.',
    },
    {
      step: '04',
      icon: Navigation2,
      title: 'Connect & Ride Securely',
      desc: 'Track live driver GPS coordinates on the interactive map over WebSockets. Dual 4-digit OTP codes verify trip start and completion.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-teal-600 dark:text-cyan-400 uppercase tracking-widest bg-teal-50 dark:bg-cyan-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-cyan-800">
            SIMPLE 4-STEP PROCESS
          </span>
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            How Campunex Works
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Connecting verified university commuters who share similar routes with zero pricing pressure and 100% spatial transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#e0f2fe] dark:bg-cyan-950/80 text-[#1e3a8a] dark:text-cyan-400 rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold text-teal-500 dark:text-cyan-400 font-mono">
                  {step}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1e3a8a] dark:bg-slate-900 text-white rounded-2xl p-8 text-center space-y-4 shadow-lg border border-[#1e3a8a] dark:border-slate-800">
          <h2 className="text-2xl font-extrabold">Ready to find your campus ride?</h2>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Join thousands of verified university students commuting safely every day.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-1.5"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
