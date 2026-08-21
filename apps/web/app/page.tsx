'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Navigation2, Search, Car, Bike, CheckCircle, Shield, MapPin, Users,
  Zap, Lock, ArrowRight, Check, ChevronDown, UserCheck, Star, Activity, Building
} from 'lucide-react';

function CampusMapSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="420" height="320" rx="16" fill="#f0f9ff" />
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="320" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {[40, 80, 120, 160, 200, 240, 280].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="420" y2={y} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      <rect x="0" y="150" width="420" height="10" fill="#cbd5e1" rx="2" opacity="0.6" />
      <rect x="200" y="0" width="10" height="320" fill="#cbd5e1" rx="2" opacity="0.6" />
      <rect x="55" y="55" width="70" height="55" rx="6" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5" />
      <text x="90" y="88" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="600">Main Gate</text>
      <rect x="165" y="55" width="50" height="60" rx="6" fill="#ccfbf1" stroke="#5eead4" strokeWidth="1.5" />
      <text x="190" y="88" textAnchor="middle" fill="#0d9488" fontSize="8" fontWeight="600">Block 34</text>
      <rect x="255" y="55" width="80" height="55" rx="6" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="1.5" />
      <text x="295" y="88" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="600">Law Gate</text>
      <path d="M90 110 L90 150 L200 155 L300 155 L300 180" stroke="#14b8a6" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round" fill="none" />
      <circle cx="90" cy="108" r="8" fill="#14b8a6" />
      <circle cx="90" cy="108" r="4" fill="white" />
      <circle cx="300" cy="182" r="8" fill="#1e3a8a" />
      <circle cx="195" cy="153" r="9" fill="#1e3a8a" />
      <circle cx="195" cy="153" r="14" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the PostGIS 500-meter matching algorithm work?',
      a: 'Campunex uses PostgreSQL and PostGIS to measure spatial route line overlap. If a driver route passes within 500 meters of your pickup and dropoff locations, the ride is automatically matched.',
    },
    {
      q: 'How does university verification work?',
      a: 'You register with your official campus email (.edu or .in domain). A 6-digit verification OTP code is issued to verify your institutional identity.',
    },
    {
      q: 'How does the Dual OTP trip security system work?',
      a: 'Before the ride starts, the driver verifies a 4-digit OTP code shown on the rider screen. Upon arrival, a second completion OTP confirms trip finalization.',
    },
    {
      q: 'Is Campunex free to use for campus commuters?',
      a: 'Yes, Campunex is designed as a direct peer-to-peer campus ride sharing platform without third-party commission surcharges.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f3460] text-white overflow-hidden py-20 md:py-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-teal-400" /> PostGIS 500m Spatial Engine & Verified Campus Rides
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 tracking-tight">
              Campus rides,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                built for university students.
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Campunex connects verified university commuters sharing overlapping routes within a 500-meter proximity threshold. Safe, real-time tracking over WebSockets.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/rides/find"
                className="px-6 py-3.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
              >
                <Search className="w-5 h-5" /> Find a Campus Ride
              </Link>
              <Link
                href="/rides/create"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition flex items-center gap-2 text-sm"
              >
                <Car className="w-5 h-5 text-cyan-400" /> Offer a Ride
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-8 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-400" /> 500m PostGIS Threshold</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-400" /> Dual OTP Security</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-400" /> Live WebSockets Map</span>
            </div>
          </div>

          <div className="hidden md:block">
            <CampusMapSVG className="w-full rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-[#1e3a8a] text-white py-5 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-extrabold text-teal-300">500 Meters</div>
            <div className="text-xs text-slate-300">Spatial Proximity Threshold</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-300">100% Verified</div>
            <div className="text-xs text-slate-300">Institutional Email Identity</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-300">Socket.IO</div>
            <div className="text-xs text-slate-300">Real-Time Driver GPS Tracking</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-300">Dual OTP</div>
            <div className="text-xs text-slate-300">SHA-256 Hash Verification</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">PostGIS & WebSockets Flow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How Campunex Works</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">Four simple steps to match campus commuters going the same way.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: UserCheck, title: 'Verify Campus Identity', desc: 'Verify your institutional identity with your campus email.' },
            { step: '02', icon: MapPin, title: 'Set Address or Route', desc: 'Type campus pickup and destination landmarks with auto-geocoding.' },
            { step: '03', icon: Users, title: '500m PostGIS Match', desc: 'PostGIS algorithms match driver route line overlaps within 500m.' },
            { step: '04', icon: Navigation2, title: 'Live Trip & Dual OTP', desc: 'Track driver GPS live over WebSockets and verify start/completion OTPs.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-[#e0f2fe] rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#1e3a8a]" />
              </div>
              <div className="text-xs font-bold text-teal-500 mb-1 tracking-widest">{step}</div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#f0f9ff] py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Core Resume Architecture</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Engineered for Campus Safety</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: 'bg-indigo-50 text-indigo-600', title: 'Institutional Identity', desc: 'Verified user authentications bounded by campus domain names (.edu / .in).' },
              { icon: MapPin, color: 'bg-teal-50 text-teal-600', title: '500m Spatial Engine', desc: 'PostGIS ST_DWithin geospatial query measuring route line overlaps.' },
              { icon: Zap, color: 'bg-amber-50 text-amber-600', title: 'Live GPS WebSockets', desc: 'Socket.IO rooms broadcasting live driver location updates to rider map.' },
              { icon: Lock, color: 'bg-rose-50 text-rose-600', title: 'Dual OTP Hash Security', desc: '4-digit initiation and completion OTPs cached in Redis with SHA-256 hashing.' },
              { icon: Car, color: 'bg-blue-50 text-blue-600', title: 'Atomic Seat Booking', desc: 'PostgreSQL serializable database transactions guaranteeing zero over-booking.' },
              { icon: Users, color: 'bg-purple-50 text-purple-600', title: 'Dev GPS Simulator', desc: 'Built-in location playback simulator for smooth dev testing without physical GPS.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about Campunex spatial ride matching</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-slate-900 text-sm flex justify-between items-center hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
