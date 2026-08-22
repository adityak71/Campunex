'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  Navigation2,
  ShieldCheck,
  MapPin,
  Users,
  CheckCircle2,
  Lock,
  Wifi,
  Car,
  Bike,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Shield,
  HeartHandshake
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiRequest } from '../lib/api';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;
      if (token) {
        try {
          const res = await apiRequest('/auth/me');
          if (res.user) {
            const role = (res.user.role || 'RIDER').toUpperCase();
            if (role === 'DRIVER') {
              router.replace('/driver');
            } else if (role === 'ADMIN') {
              router.replace('/admin');
            } else {
              router.replace('/dashboard');
            }
          }
        } catch (e) {
          // Token invalid or expired
        }
      }
    }
    checkAuthAndRedirect();
  }, [router]);

  const faqs = [
    {
      q: 'How does university email verification work?',
      a: 'We validate your campus email domain (.edu or .in) by sending a 6-digit verification OTP. Only verified students and staff can participate in rides.',
    },
    {
      q: 'What makes Campunex different from commercial ride apps?',
      a: 'Campunex is built exclusively for university communities with zero commercial price surging. Matching is based on 500m route overlap and verified campus identities.',
    },
    {
      q: 'How does the 500-meter route matching work?',
      a: 'Our spatial database measures driver route overlap with your pickup and dropoff points. If the driver route passes within 500 meters, you get a verified match score.',
    },
    {
      q: 'How does Dual OTP security keep my ride safe?',
      a: 'Riders receive a 4-digit Start OTP when meeting the driver and a 4-digit Completion OTP at dropoff. Codes are verified in real time before trip state updates.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 space-y-20 pb-16">
        {/* SECTION 1: HERO */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#e0f2fe] dark:bg-cyan-950/80 text-[#1e3a8a] dark:text-cyan-300 border border-[#bae6fd] dark:border-cyan-800 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                <span>Verified Campus Mobility Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1e3a8a] dark:text-slate-100 tracking-tight leading-tight">
                Your campus. <br />
                <span className="text-[#14b8a6] dark:text-cyan-400">Your route.</span> Your ride.
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Connect with verified university members traveling along similar routes. Real-time 500m route matching, live GPS tracking, and dual OTP security.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/rides/find">
                  <Button variant="teal" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Find a Ride
                  </Button>
                </Link>
                <Link href="/rides/create">
                  <Button variant="primary" size="lg" leftIcon={<Car className="w-4 h-4" />}>
                    Offer a Ride
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> .edu / .in Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-cyan-400" /> 500m Route Match
                </span>
              </div>
            </motion.div>

            {/* Visual Campus Map Simulation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">Live Route Matcher</span>
                </div>
                <Badge variant="verified">92% Route Match</Badge>
              </div>

              <div className="h-64 bg-slate-100 dark:bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-slate-200 dark:border-slate-800">
                {/* SVG Route Visualizer */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                  <path d="M 40 160 Q 150 40 360 140" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeDasharray="4" />
                  <path d="M 40 160 Q 150 40 360 140" fill="none" stroke="#14b8a6" strokeWidth="4" />
                  <circle cx="60" cy="150" r="8" fill="#1e3a8a" />
                  <circle cx="340" cy="130" r="8" fill="#0d9488" />
                  <circle cx="200" cy="85" r="10" fill="#14b8a6" className="animate-ping opacity-75" />
                  <circle cx="200" cy="85" r="6" fill="#1e3a8a" />
                </svg>

                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow">
                  📍 Pickup within 320m of driver route
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-teal-700 dark:text-cyan-400 shadow">
                  🚗 Driver Location: Active GPS Stream
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: TRUST INDICATORS */}
        <section className="bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-400 font-mono">47+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified Universities</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-400 font-mono">12,800+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Campus Members</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-400 font-mono">48,300+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed Trips</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-400 font-mono">98.4%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Route Match Accuracy</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="info">SIMPLE PROCESS</Badge>
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">How Campunex Works</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Four easy steps to start sharing campus commutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Verify', desc: 'Confirm your account with your official university email domain.' },
              { num: '02', title: 'Search', desc: 'Enter your pickup landmark, destination, and travel schedule.' },
              { num: '03', title: 'Match', desc: 'Our engine finds compatible driver routes within 500m proximity.' },
              { num: '04', title: 'Ride', desc: 'Connect, verify dual OTP security, and track your trip live.' },
            ].map((step, idx) => (
              <Card key={idx} hoverable className="space-y-3">
                <span className="text-2xl font-extrabold text-teal-500 dark:text-cyan-400 font-mono">{step.num}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: ROUTE MATCHING */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card className="p-8 md:p-12 space-y-6">
            <div className="max-w-2xl space-y-3">
              <Badge variant="verified">500m PROXIMITY ENGINE</Badge>
              <h2 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Precision Route Line Overlap
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rather than checking static pickup points, Campunex measures whether the driver's planned route polyline passes within 500 meters of your pickup and dropoff landmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Route Compatibility (40%)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Measures geometric route trajectory overlap</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Pickup Proximity (30%)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Calculates exact distance to driver route</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Schedule Alignment (30%)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Filters departure time windows</div>
              </div>
            </div>
          </Card>
        </section>

        {/* SECTION 5: UNIVERSITY VERIFICATION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="success">TRUSTED IDENTITY</Badge>
              <h2 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Exclusive to Verified Campus Members
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Security begins with identity. Registration is restricted to users holding verified university email addresses (.edu, .ac.in, .in). Accounts receive verified trust badges upon email OTP validation.
              </p>
            </div>
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  AM
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    Alex Morgan
                    <Badge variant="verified">Verified Student</Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">alex.m@lpu.in</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 6: BIKE & CAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 text-center">
          <h2 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">Flexible Commute Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card hoverable className="p-6 space-y-2 text-center">
              <Car className="w-8 h-8 text-teal-600 dark:text-cyan-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Car Commutes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share 1-4 available seats with fellow students traveling to campus or nearby stations.</p>
            </Card>
            <Card hoverable className="p-6 space-y-2 text-center">
              <Bike className="w-8 h-8 text-teal-600 dark:text-cyan-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Bike Rides</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quick single-passenger rides across campus blocks and nearby transit stops.</p>
            </Card>
          </div>
        </section>

        {/* SECTION 7: LIVE TRACKING */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card className="p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-teal-600 dark:text-cyan-400 animate-pulse" />
              <h2 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">Real-Time WebSocket GPS Streaming</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              During active trips, the driver's GPS location streams via authenticated Socket.IO WebSockets directly to the rider's interactive map without manual refreshes.
            </p>
          </Card>
        </section>

        {/* SECTION 8: OTP SECURITY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3">
              <Lock className="w-6 h-6 text-teal-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">1. Ride Initiation OTP</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A 4-digit code is generated and delivered to the rider. The driver enters the OTP upon arrival to start the trip.
              </p>
            </Card>
            <Card className="p-6 space-y-3">
              <Lock className="w-6 h-6 text-teal-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">2. Completion OTP</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                At the destination, a second 4-digit code verifies dropoff completion before finalizing the trip in PostgreSQL.
              </p>
            </Card>
          </div>
        </section>

        {/* SECTION 9: SAFETY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <Badge variant="warning">SAFETY & TRUST</Badge>
          <h2 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">Built Around Student Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2 text-center">
              <Shield className="w-6 h-6 text-teal-600 dark:text-cyan-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Verified Profiles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">No anonymous riders or unverified drivers permitted.</p>
            </Card>
            <Card className="p-5 space-y-2 text-center">
              <Lock className="w-6 h-6 text-teal-600 dark:text-cyan-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dual Code Lock</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographic hashes stored with short Redis TTLs.</p>
            </Card>
            <Card className="p-5 space-y-2 text-center">
              <HeartHandshake className="w-6 h-6 text-teal-600 dark:text-cyan-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Community Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zero-tolerance policy for policy violations.</p>
            </Card>
          </div>
        </section>

        {/* SECTION 10: FAQS */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-slate-900 dark:text-slate-100 text-sm flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 11: COMMUNITY RULES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <h3 className="text-sm font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Campunex Community Code of Conduct
            </h3>
            <p>1. Always verify driver identity and vehicle details before entering the vehicle.</p>
            <p>2. Keep your 4-digit initiation OTP private until you meet your driver.</p>
            <p>3. Respect fellow students and maintain clean, punctual travel schedules.</p>
          </Card>
        </section>

        {/* SECTION 12: FINAL CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#1e3a8a] dark:bg-slate-900 text-white rounded-3xl p-10 text-center space-y-4 shadow-xl border border-[#1e3a8a] dark:border-slate-800">
            <h2 className="text-3xl font-extrabold">Start Sharing Campus Commutes Today</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Join your verified campus network and connect with nearby commuters.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Link href="/register">
                <Button variant="teal" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 13: FOOTER */}
      <Footer />
    </div>
  );
}
