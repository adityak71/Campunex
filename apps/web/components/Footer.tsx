'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#1e3a8a] dark:bg-cyan-600 rounded-lg flex items-center justify-center">
                <Navigation2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Camp<span className="text-[#14b8a6] dark:text-cyan-400">unex</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Campus ride-matching platform for verified university students. PostGIS 500m proximity algorithm & dual OTP security.
            </p>
            <p className="text-xs mt-4 text-slate-500">© 2026 Campunex. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Home</Link></li>
              <li><Link href="/how-it-works" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">How It Works</Link></li>
              <li><Link href="/rides/find" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Find Rides</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Support & Safety</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/safety" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Safety Center</Link></li>
              <li><Link href="/help" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 dark:hover:text-cyan-400 transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">PostGIS & Security</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">500m Proximity Threshold</span></li>
              <li><span className="text-slate-400">Dual 4-Digit OTP Hashes</span></li>
              <li><span className="text-slate-400">Institutional Email Identity</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>Built for university campus communities.</p>
          <div className="flex items-center gap-3">
            <span className="bg-teal-950/60 text-teal-400 border border-teal-800/80 px-2.5 py-1 rounded-full font-semibold">
              ✓ Verified Platform
            </span>
            <span className="bg-blue-950/60 text-blue-400 border border-blue-800/80 px-2.5 py-1 rounded-full font-semibold">
              PostGIS 500m Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
