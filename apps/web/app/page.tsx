'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card, { CardHead, CardBody } from '../components/ui/Card';
import InstallAppModal from '../components/InstallAppModal';
import {
  Navigation2,
  ShieldCheck,
  Shield,
  MapPin,
  Users,
  Car,
  Search,
  Settings,
  FileText,
  PlusCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowDown,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Zap,
  HardDrive,
  WifiOff,
  Compass,
  CalendarCheck,
  Radio,
  Quote,
  ChevronDown,
  Sparkles,
  GitFork,
  Eye,
  BadgeCheck
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRequested, setIsRequested] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<'android' | 'ios' | 'mac'>('mac');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('campunex_token') : null;
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          if (res?.user?.role) {
            setUserRole(res.user.role.toUpperCase());
          }
        })
        .catch(() => setUserRole(null));
    }
  }, []);

  const openInstall = async (platform: 'android' | 'ios' | 'mac') => {
    setInstallPlatform(platform);

    // If native prompt is available (Chrome/Edge/Android), trigger it directly!
    const prompt = typeof window !== 'undefined' ? (window as any).__campunexDeferredPrompt : null;
    if (prompt && platform !== 'ios') {
      try {
        prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          (window as any).__campunexDeferredPrompt = null;
          return;
        }
      } catch (e) {
        // Fallback to step modal
      }
    }

    setInstallModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const findRideHref = userRole === 'RIDER' ? '/rides/find' : userRole === 'DRIVER' ? '/driver' : '/rides/find';
  const offerRideHref = userRole === 'DRIVER' ? '/driver/offer' : userRole === 'RIDER' ? '/dashboard' : '/login';

  const faqData = [
    {
      q: 'What is Campunex?',
      a: 'Campunex is a dedicated campus mobility and ride-sharing platform created specifically for universities. It connects students, faculty, and campus staff who share similar transit routes, whether commuting to classes, navigating dorm circuits late at night, or traveling together to airport and transit stations.'
    },
    {
      q: 'How does campus ride matching work?',
      a: 'Drivers input their starting location, target campus hub, departure time, and available seat count. Riders searching for congruent pathways can view live route vectors, request seats instantly, and coordinate directly at designated campus safety pickup stations.'
    },
    {
      q: 'How do I find or offer a ride?',
      a: 'Finding a ride takes just a tap from the main dispatch screen: enter your drop-off building or off-campus neighborhood. To offer a ride, tap "Offer a ride", set your car details, verified vehicle color, seat availability, and optional split-fare reimbursement amount.'
    },
    {
      q: 'How does campus verification work?',
      a: 'All users must authenticate using an authorized institutional email domain (.edu or verified campus partner domain). Peer drivers undergo identity review, student status validation, and valid driver registration checks before their routes go live on the dispatch board.'
    },
    {
      q: 'Can I install Campunex on Android, iPhone, and Mac?',
      a: 'Yes. Campunex is engineered as a modern Progressive Web App (PWA). You can install it straight from your browser on Android, iOS Safari, macOS, and Windows with zero 100MB downloads, saving device storage while retaining full push-notification capabilities.'
    },
    {
      q: 'Do I need to install Campunex to use the website?',
      a: 'No installation is strictly required. The web experience is fully functional in standard mobile or desktop web browsers. However, installing it to your home screen provides quick one-tap launching, persistent session tokens, and instant route alerts.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* 1. HERO SECTION                                         */}
        {/* ======================================================== */}
        <section className="relative w-full overflow-hidden bg-surface-container-lowest">
          {/* Atmospheric glows */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/2 right-[-10%] w-[550px] h-[550px] bg-secondary-container/25 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-margin-tablet lg:px-margin-desktop pt-8 pb-12 lg:py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-space-xl items-center">
              
              {/* LEFT COLUMN (52%) */}
              <div className="lg:col-span-7 flex flex-col items-start gap-5 lg:gap-space-lg z-10">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-md text-xs shadow-sm border border-white/8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="tracking-wider uppercase font-semibold text-[11px]">CAMPUS MOBILITY, MADE BETTER</span>
                </div>

                {/* Main & Supporting Headline */}
                <div className="flex flex-col gap-2">
                  <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-[44px] lg:leading-[52px] text-on-surface tracking-tight font-extrabold max-w-2xl">
                    Your campus. Your people.{' '}
                    <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
                      Every ride, better.
                    </span>
                  </h1>
                  <p className="font-headline-md text-lg sm:text-xl text-secondary font-medium tracking-normal mt-1">
                    Find your ride. Share your route. Get there together.
                  </p>
                </div>

                {/* Narrative paragraph */}
                <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
                  Campunex makes campus travel easier with coordinated rides, verified student and faculty profiles, and a shared community built around getting there safely and affordably.
                </p>

                {/* Action Button Cluster */}
                <div className="flex flex-wrap items-center gap-3 pt-1 w-full sm:w-auto">
                  <Link
                    href={findRideHref}
                    className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-title-sm text-sm font-semibold shadow-lg hover:shadow-[0_0_28px_rgba(160,120,255,0.45)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Find a ride</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href={offerRideHref}
                    className="px-6 py-3 rounded-xl bg-surface-container-high text-secondary hover:text-on-surface hover:bg-surface-container-highest transition-all font-title-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-sm border border-white/6"
                  >
                    <Car className="w-4 h-4" />
                    <span>Offer a ride</span>
                  </Link>
                </div>

                {/* Reassurance and Anchored link */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-xs">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>One campus community. Smarter ways to travel.</span>
                  </div>
                  <a
                    href="#how-it-works"
                    className="font-title-sm text-xs font-semibold text-primary hover:text-primary-fixed transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>See how Campunex works</span>
                    <ArrowDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN (48%) Interactive Storytelling Vector Visual */}
              <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end">
                {/* Outer Terminal Frame */}
                <div className="relative w-full max-w-[500px] aspect-[4/4.4] rounded-2xl bg-surface-container-low p-2 shadow-2xl border border-white/10 overflow-hidden flex flex-col">
                  {/* Campus Map Canvas Background */}
                  <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-surface-container-lowest">
                    {/* Synthesized stylized dark campus map grid (SVG) */}
                    <svg
                      className="absolute inset-0 w-full h-full opacity-70"
                      fill="none"
                      viewBox="0 0 460 480"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient cx="50%" cy="50%" id="mapGlow" r="50%">
                          <stop offset="0%" stopColor="#a078ff" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0a0d1c" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient
                          gradientUnits="userSpaceOnUse"
                          id="routeGradient"
                          x1="80"
                          x2="360"
                          y1="360"
                          y2="120"
                        >
                          <stop offset="0%" stopColor="#d0bcff" />
                          <stop offset="50%" stopColor="#a078ff" />
                          <stop offset="100%" stopColor="#38ef7d" />
                        </linearGradient>
                      </defs>

                      {/* Grid terrain */}
                      <rect fill="#0a0d1c" height="100%" width="100%" />
                      <circle cx="230" cy="240" fill="url(#mapGlow)" r="210" />

                      {/* Water feature / Campus Lake */}
                      <path
                        d="M-20 400 Q80 340 160 390 T300 370 T480 430 L480 490 L-20 490 Z"
                        fill="#181b2a"
                        opacity="0.6"
                      />

                      {/* Campus pathway layout */}
                      <path d="M40 0 V480" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M140 0 V480" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M260 0 V480" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M380 0 V480" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M0 90 H460" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M0 200 H460" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M0 310 H460" stroke="#1c1f2e" strokeWidth="1.5" />
                      <path d="M0 410 H460" stroke="#1c1f2e" strokeWidth="1.5" />

                      {/* Campus Buildings (Subtle silhouettes) */}
                      <rect fill="#181b2a" height="60" rx="6" width="70" x="55" y="110" />
                      <text fill="#494454" fontFamily="Geist, sans-serif" fontSize="9" x="65" y="145">
                        ENG HALL
                      </text>

                      <rect fill="#1c1f2e" height="90" rx="8" width="85" x="160" y="70" />
                      <text fill="#958ea0" fontFamily="Geist, sans-serif" fontSize="9" x="175" y="120">
                        STADIUM LOT
                      </text>

                      <rect fill="#262939" height="95" opacity="0.9" rx="10" width="110" x="290" y="80" />
                      <text
                        fill="#d0bcff"
                        fontFamily="Geist, sans-serif"
                        fontSize="10"
                        fontWeight="600"
                        x="305"
                        y="130"
                      >
                        MAIN COMMONS
                      </text>

                      <rect fill="#1c1f2e" height="75" rx="8" width="105" x="65" y="270" />
                      <text fill="#958ea0" fontFamily="Geist, sans-serif" fontSize="9" x="80" y="315">
                        NORTH DORM
                      </text>

                      <rect fill="#181b2a" height="110" rx="6" width="75" x="280" y="240" />
                      <text fill="#494454" fontFamily="Geist, sans-serif" fontSize="9" x="292" y="300">
                        SCIENCE LAB
                      </text>

                      {/* THE ROUTE: S-Curve matching inspiration */}
                      <path
                        d="M 85 365 C 130 365, 175 285, 230 240 C 290 190, 310 130, 360 130"
                        opacity="0.3"
                        stroke="#a078ff"
                        strokeLinecap="round"
                        strokeWidth="14"
                      />
                      <path
                        d="M 85 365 C 130 365, 175 285, 230 240 C 290 190, 310 130, 360 130"
                        id="transitRoutePath"
                        stroke="url(#routeGradient)"
                        strokeLinecap="round"
                        strokeWidth="6"
                      />

                      {/* Waypoint Station Circle (Midpoint pickup) */}
                      <circle cx="230" cy="240" fill="#1c1f2e" r="16" stroke="#d0bcff" strokeWidth="3" />
                      <circle cx="230" cy="240" fill="#a078ff" r="7" />

                      {/* Start Node: North Gate Entrance */}
                      <circle cx="85" cy="365" fill="#0f1221" r="14" stroke="#d0bcff" strokeWidth="3" />
                      <circle cx="85" cy="365" fill="#d0bcff" r="6" />

                      {/* Destination Node: Main Library (Emerald active beacon) */}
                      <circle cx="360" cy="130" fill="#0f1221" r="15" stroke="#34d399" strokeWidth="4" />
                      <circle cx="360" cy="130" fill="#10b981" r="7" />

                      {/* Animated transit beacon pulsing on route */}
                      <circle cx="280" cy="195" fill="#ffffff" r="5">
                        <animate attributeName="opacity" dur="1.8s" repeatCount="indefinite" values="1;0.3;1" />
                      </circle>
                    </svg>

                    {/* Landmark Overlay Labels */}
                    <div className="absolute bottom-16 left-5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-md text-on-surface border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-[11px] font-medium">North Gate</span>
                    </div>
                    <div className="absolute top-14 right-5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-md text-on-surface border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="font-label-sm text-[11px] font-medium">Main Commons</span>
                    </div>

                    {/* Top Floating Verified Trip Status Pill */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-container/85 backdrop-blur-md shadow-lg border border-white/8">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span className="font-label-md text-xs font-semibold text-on-surface">Verified Campus Journey</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">Live sync</span>
                      </div>
                    </div>

                    {/* Main Floating Ride Glass Card */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 p-3.5 rounded-xl bg-surface-container-high/90 backdrop-blur-xl shadow-2xl border border-white/12 transition-all duration-300">
                      <div className="flex items-center justify-between pb-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-[11px] font-semibold">
                          <span>Campus Ride • Today</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-label-sm text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>2 seats available</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <h2 className="font-title-sm text-sm font-semibold text-on-surface">North Gate → Main Commons</h2>
                          <p className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span>Departing 6:15 PM</span>
                            <span>•</span>
                            <span>8 min transit</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-headline-md text-base font-bold text-on-surface">₹40</span>
                          <span className="block font-label-sm text-[10px] text-outline">split fare</span>
                        </div>
                      </div>

                      {/* Driver Information & Quick Hail */}
                      <div className="pt-1 mt-1 flex items-center justify-between gap-2 bg-surface-container-low/70 p-2 rounded-lg border border-white/6">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                            alt="Alex M."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4JeW5m1ai1c8C3XMJoFQu3DC-GGrdinWlI_Oqu0GLsb6GalK7l20b2leLI61IaKGAS74p68nhoelr_sUNID2rFx4GZpylbpmjVBvHXd4wXzZU4ZiBGzSZGZwN6bVUk4Nw0-fauNoqrQ9gCNe1Q-FdwWM-UfV50GZPrHLpuqq85DbVw1a-kh56nFkVzmVUPvhoGAt8Ytb6ks68CzFUxpzK3uRFG0WBpuRQsr1b7QWXQYxtGe4ShpKRvw"
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1">
                              <span className="font-label-md text-xs font-semibold text-on-surface truncate">Alex M.</span>
                              <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                            </div>
                            <p className="font-body-sm text-[10px] text-on-surface-variant truncate">Engineering &apos;25 • 4.9 ★</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsRequested(!isRequested)}
                          className={`px-3.5 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all shadow-sm shrink-0 ${
                            isRequested
                              ? 'bg-emerald-500 text-white'
                              : 'bg-primary hover:bg-primary-fixed-dim text-on-primary'
                          }`}
                        >
                          {isRequested ? 'Requested ✓' : 'Request Seat'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. QUICK ACTION STRIP                                    */}
        {/* ======================================================== */}
        <section className="w-full bg-surface-container-low py-10 lg:py-14 relative" id="quick-actions">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-margin-tablet lg:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-space-lg">
              {/* Card 1: Find a ride */}
              <div className="group p-6 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-300 shadow-md flex flex-col justify-between hover:-translate-y-1 border border-white/6">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Find a ride</h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Discover verified campus rides that match your route, class schedule, and transit preferences.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={findRideHref}
                    className="inline-flex items-center gap-1.5 font-title-sm text-xs font-semibold text-primary group-hover:text-primary-fixed transition-colors"
                  >
                    <span>Explore rides</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Offer a ride */}
              <div className="group p-6 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-300 shadow-md flex flex-col justify-between hover:-translate-y-1 border border-white/6">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Offer a ride</h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Share your available passenger seats with fellow students and faculty to split fuel and parking costs.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={offerRideHref}
                    className="inline-flex items-center gap-1.5 font-title-sm text-xs font-semibold text-secondary group-hover:text-on-secondary-container transition-colors"
                  >
                    <span>Offer a seat</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Schedule a trip */}
              <div className="group p-6 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-300 shadow-md flex flex-col justify-between hover:-translate-y-1 border border-white/6">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-on-surface">Schedule a trip</h3>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Plan your morning commute, late-night study library return, or weekend transit station transfer ahead.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={findRideHref}
                    className="inline-flex items-center gap-1.5 font-title-sm text-xs font-semibold text-tertiary group-hover:text-tertiary-fixed transition-colors"
                  >
                    <span>Plan a trip</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. CAMPUS SAFETY & TRUST SECTION                        */}
        {/* ======================================================== */}
        <section className="w-full bg-surface py-12 lg:py-20 relative border-t border-white/6" id="safety">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-2xl flex flex-col gap-2 mb-10">
              <span className="font-label-md text-xs font-semibold text-primary uppercase tracking-widest">
                Built For University Life
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
                Campus travel, built around trust.
              </h2>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant">
                Better coordination starts with a community that knows who it is travelling with. Safe, predictable, and verified at every step.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feature 1: Verified Communities */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-surface-container-high text-primary mb-6 border border-white/6">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-2 uppercase tracking-wide">
                    VERIFIED COMMUNITIES
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                    Support institutional email verification and optional identity checks for an accountable campus network.
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2 bg-surface-container-lowest/40 p-4 rounded-xl border border-white/4">
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>.edu and campus email authorization</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Student ID &amp; department matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Privacy-first contact masking</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Smarter Ride Coordination */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-surface-container-high text-secondary mb-6 border border-white/6">
                    <GitFork className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-2 uppercase tracking-wide">
                    SMARTER RIDE COORDINATION
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                    Discover rides, coordinate pickup details, and plan journeys together in one shared, intuitive interface.
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2 bg-surface-container-lowest/40 p-4 rounded-xl border border-white/4">
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span>Designated campus safe pickup spots</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span>Instant seat reservation &amp; confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span>Integrated trip messaging</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Better Trip Visibility */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-surface-container-high text-tertiary mb-6 border border-white/6">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-2 uppercase tracking-wide">
                    BETTER TRIP VISIBILITY
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                    Keep track of live trip updates, status notifications, and university safety check-ins from door to door.
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2 bg-surface-container-lowest/40 p-4 rounded-xl border border-white/4">
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                    <span>Live status &amp; arrival confirmations</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                    <span>Campus Security quick-dial sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface font-body-sm text-xs">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0" />
                    <span>Trusted emergency ride contacts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Visual Photographic Proof Card */}
            <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col gap-3">
                <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-semibold">
                  Campus Safety Benchmark
                </span>
                <h3 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface leading-tight">
                  Designed with campus escort &amp; security protocols in mind.
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Whether traveling between dorms after midnight, attending off-campus study sessions, or heading to the medical quadrant, every transit line on Campunex adheres to vetted safety thresholds.
                </p>
                <div className="flex items-center gap-8 pt-3">
                  <div>
                    <span className="font-headline-xl text-3xl font-extrabold text-primary">100%</span>
                    <span className="block font-label-md text-xs text-on-surface-variant mt-0.5">Verified .edu Users</span>
                  </div>
                  <div className="w-px h-10 bg-white/10"></div>
                  <div>
                    <span className="font-headline-xl text-3xl font-extrabold text-secondary">4.92 / 5</span>
                    <span className="block font-label-md text-xs text-on-surface-variant mt-0.5">Average Rider Rating</span>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface-container border border-white/10">
                <img
                  className="w-full h-full object-cover"
                  alt="Campunex Safe Campus Hub"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZalwWfLJJIQ_W0Yfqylg8gQpZSGytrWQyH4PQblLL9vpX7OZygBXC1WKP1A1FOMdLq5Hisef1cHFkJg89nAbvQl5iIss8n-EmDgClGLjywk7KfmVHE3X-yaydX4Qe1bcJxP8XgjAlvYOhZ3Wv6WUiGZcJ9ftSbpoRL58x9UeCVOUWoyaQjSqaO-hCPlAD87N6xVZxDlms4sVjZOGLlZ0h0SDnkrZ24rfizPtlxhZSshMeRBl-UmxWdg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-on-surface">
                  <span className="font-body-sm text-xs font-semibold text-white drop-shadow">South Quad Hub • Monitored Route</span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-highest/90 backdrop-blur-md font-label-sm text-[11px] font-bold text-primary border border-white/10">
                    Active Escort Zone
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. HOW CAMPUNEX WORKS SECTION                           */}
        {/* ======================================================== */}
        <section className="w-full bg-surface-container-lowest py-14 lg:py-20 relative border-t border-white/6" id="how-it-works">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-margin-tablet lg:px-margin-desktop">
            <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
              <span className="font-label-md text-xs font-semibold text-primary uppercase tracking-widest">
                Simple &amp; Frictionless
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
                How Campunex works
              </h2>
              <p className="font-body-lg text-sm sm:text-base text-on-surface-variant">
                Connect with verified students and staff in three effortless steps.
              </p>
            </div>

            {/* 3-Step Row with desktop connector line */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-space-xl">
              <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-30 pointer-events-none"></div>

              {/* Step 01 */}
              <div className="relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-headline-md text-lg font-bold mb-4 z-10 shadow-md ring-4 ring-surface-container-low border border-white/10">
                  01
                </div>
                <h3 className="font-headline-md text-base font-bold text-on-surface mb-2">
                  Join your campus community
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Create an account with your university credentials and complete the quick identity verification steps.
                </p>
                <div className="w-full p-3 rounded-xl bg-surface-container flex items-center justify-center gap-2 text-primary border border-white/6">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="font-label-md text-xs font-semibold text-on-surface">Instant .EDU Clearance</span>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-primary-container text-white flex items-center justify-center font-headline-md text-lg font-bold mb-4 z-10 shadow-md ring-4 ring-surface-container-low border border-white/10">
                  02
                </div>
                <h3 className="font-headline-md text-base font-bold text-on-surface mb-2">
                  Find or offer a ride
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Explore available campus trips, compare convenient schedules, or share your carpool route and open passenger seats.
                </p>
                <div className="w-full p-3 rounded-xl bg-surface-container flex items-center justify-center gap-2 text-secondary border border-white/6">
                  <GitFork className="w-4 h-4" />
                  <span className="font-label-md text-xs font-semibold text-on-surface">Intelligent Route Matching</span>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-white/8 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-headline-md text-lg font-bold mb-4 z-10 shadow-md ring-4 ring-surface-container-low border border-white/10">
                  03
                </div>
                <h3 className="font-headline-md text-base font-bold text-on-surface mb-2">
                  Coordinate and travel
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Confirm designated pickup points, message your driver directly, and travel with real-time transit status updates.
                </p>
                <div className="w-full p-3 rounded-xl bg-surface-container flex items-center justify-center gap-2 text-emerald-400 border border-white/6">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-label-md text-xs font-semibold text-on-surface">Live Ride Completion</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-10 text-center">
              <Link
                href={userRole ? (userRole === 'DRIVER' ? '/driver' : '/dashboard') : '/register'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-title-sm text-sm font-bold shadow-lg hover:shadow-[0_0_24px_rgba(208,188,255,0.4)] transition-all"
              >
                <span>Get started with Campunex</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. MULTI-PLATFORM PWA INSTALLATION SUITE                */}
        {/* ======================================================== */}
        <section className="w-full bg-surface-container py-14 lg:py-20 relative border-t border-b border-white/6" id="install">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-margin-tablet lg:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-space-xl items-center">
              
              {/* Left: Device Mockup */}
              <div className="lg:col-span-5 flex items-center justify-center order-2 lg:order-1">
                <div className="relative w-full max-w-[320px] aspect-[9/18.5] rounded-[36px] bg-[#121421] p-3 shadow-2xl border-4 border-surface-container-highest/60 flex flex-col justify-between">
                  <div className="w-24 h-4 bg-black rounded-b-xl mx-auto z-20"></div>

                  <div className="flex-1 w-full flex flex-col justify-between p-2 pt-1 space-y-3">
                    <div className="flex items-center justify-between px-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="font-headline-md text-xs font-bold text-on-surface">Campunex PWA</span>
                      </div>
                      <Radio className="w-3.5 h-3.5 text-on-surface-variant animate-pulse" />
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container shadow-md flex flex-col gap-1.5 border border-white/8">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] text-primary uppercase font-bold">Fast Dispatch</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      </div>
                      <p className="font-title-sm text-xs font-semibold text-on-surface">Campus Loop Express</p>
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>Next stop: West Dorms</span>
                        <span className="font-semibold text-secondary">3 min</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-auto py-2">
                      <Link href="/rides/find" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center group-hover:scale-105 transition-transform border border-primary/20">
                          <Compass className="w-5 h-5" />
                        </div>
                        <span className="font-label-sm text-[10px] text-on-surface-variant">Rides</span>
                      </Link>
                      <Link href="/driver/offer" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform border border-secondary/20">
                          <Car className="w-5 h-5" />
                        </div>
                        <span className="font-label-sm text-[10px] text-on-surface-variant">Carpool</span>
                      </Link>
                      <Link href="/safety" className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform border border-rose-500/20">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-label-sm text-[10px] text-on-surface-variant">Safety</span>
                      </Link>
                    </div>

                    <div className="w-full py-2 px-4 rounded-xl bg-surface-container-high flex items-center justify-between text-on-surface-variant border border-white/6">
                      <Navigation2 className="w-4 h-4 text-primary" />
                      <Search className="w-4 h-4 text-white/50" />
                      <Users className="w-4 h-4 text-white/50" />
                      <Settings className="w-4 h-4 text-white/50" />
                    </div>
                  </div>

                  <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mb-1"></div>
                </div>
              </div>

              {/* Right: Installation suite details */}
              <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary font-label-md text-xs w-fit border border-white/8">
                    <Download className="w-3.5 h-3.5" />
                    <span className="font-semibold text-[11px] tracking-wider uppercase">NO APP STORE REQUIRED</span>
                  </div>
                  <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
                    Your campus rides. One tap away.
                  </h2>
                  <p className="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    Install Campunex on your device for instant access to your campus ride experience with fast offline loading, minimal data usage, and zero app store delays.
                  </p>
                </div>

                {/* 3 Interactive Platform Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Android Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col justify-between gap-4 border border-white/8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-primary">
                        <Smartphone className="w-4 h-4" />
                        <span className="font-title-sm text-sm font-semibold text-on-surface">Android</span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Add Campunex to your home screen for an app-like experience with notifications.
                      </p>
                    </div>
                    <button
                      onClick={() => openInstall('android')}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all text-on-surface font-label-md text-xs font-semibold text-center border border-white/6"
                    >
                      Install on Android
                    </button>
                  </div>

                  {/* iPhone Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col justify-between gap-4 border border-white/8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-secondary">
                        <Smartphone className="w-4 h-4" />
                        <span className="font-title-sm text-sm font-semibold text-on-surface">iPhone</span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Add Campunex directly to your iOS Home Screen and launch in full screen.
                      </p>
                    </div>
                    <button
                      onClick={() => openInstall('ios')}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-on-surface font-label-md text-xs font-semibold text-center border border-white/6"
                    >
                      Install on iPhone
                    </button>
                  </div>

                  {/* Mac & PC Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col justify-between gap-4 border border-white/8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-tertiary">
                        <Laptop className="w-4 h-4" />
                        <span className="font-title-sm text-sm font-semibold text-on-surface">Mac & PC</span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Keep Campunex right on your macOS Dock or Windows taskbar for instant bookings.
                      </p>
                    </div>
                    <button
                      onClick={() => openInstall('mac')}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container-highest hover:bg-tertiary-container hover:text-on-tertiary transition-all text-on-surface font-label-md text-xs font-semibold text-center border border-white/6"
                    >
                      Install on Mac
                    </button>
                  </div>
                </div>

                {/* PWA benefits pill row */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-on-surface-variant font-body-sm text-xs">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Instant startup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-secondary" /> Under 2MB cache
                  </span>
                  <span className="flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-emerald-400" /> Offline route viewing
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. EDITORIAL BRAND QUOTE                                 */}
        {/* ======================================================== */}
        <section className="w-full py-12 lg:py-16 bg-surface relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-[600px] h-[300px] bg-gradient-to-r from-primary-container via-secondary-container to-primary blur-[150px] rounded-full"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-margin-tablet text-center relative z-10 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
              <Quote className="w-5 h-5" />
            </div>
            <blockquote className="font-headline-xl text-xl sm:text-2xl md:text-3xl font-semibold text-on-surface tracking-tight">
              &ldquo;Good journeys are better when you don&apos;t travel alone.&rdquo;
            </blockquote>
            <p className="font-headline-md text-sm sm:text-base text-secondary font-medium">
              Find your people. Share the journey. Make campus travel simpler.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-on-surface-variant font-body-sm text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>Campunex Campus Mobility Initiative</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (INTERACTIVE FAQ ACCORDION)*/}
        {/* ======================================================== */}
        <section className="w-full bg-surface-container-lowest py-14 lg:py-20 relative border-t border-white/6" id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-margin-tablet">
            <div className="text-center mb-10 flex flex-col gap-2">
              <span className="font-label-md text-xs font-semibold text-primary uppercase tracking-widest">
                Clear Answers
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant">
                Everything you need to know about campus ride matching, safety, and Progressive Web App installation with Campunex.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqData.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl bg-surface-container-low border border-white/8 overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between text-on-surface font-title-sm text-sm font-semibold focus:outline-none hover:bg-white/5 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-primary shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-on-surface-variant font-body-md text-xs leading-relaxed border-t border-white/6 pt-3 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 8. PRESERVED RBAC USER QUICK ENTRY POINTS (CAMPUNEX)     */}
        {/* ======================================================== */}
        <section className="max-w-[1180px] mx-auto px-4 md:px-6 py-12 border-t border-white/6">
          <Card className="!p-0 border-white/10 bg-white/[0.03]">
            <CardHead className="border-white/5">
              <strong className="text-sm font-bold text-white/90">
                {userRole === 'DRIVER'
                  ? 'Driver Quick Actions'
                  : userRole === 'ADMIN'
                  ? 'Administration Controls'
                  : userRole === 'RIDER'
                  ? 'Rider Quick Actions'
                  : 'Get Started with Campunex'}
              </strong>
              <span className="text-xs text-white/50 font-medium">
                {userRole
                  ? `Active session verified (${userRole})`
                  : 'Institutional university ride-sharing network'}
              </span>
            </CardHead>
            <CardBody className="flex flex-wrap gap-3">
              {userRole === 'DRIVER' ? (
                <>
                  <Link
                    href="/driver"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-primary/40 bg-gradient-to-br from-primary-container to-secondary-container text-white shadow-md hover:-translate-y-px transition-transform"
                  >
                    <Car className="w-4 h-4" /> Driver Home
                  </Link>
                  <Link
                    href="/driver/offer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Publish a Ride
                  </Link>
                  <Link
                    href="/driver/rides"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <FileText className="w-4 h-4" /> My Published Rides
                  </Link>
                </>
              ) : userRole === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-primary/40 bg-gradient-to-br from-primary-container to-secondary-container text-white shadow-md hover:-translate-y-px transition-transform"
                  >
                    <Settings className="w-4 h-4" /> Admin Console
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <FileText className="w-4 h-4" /> User Management
                  </Link>
                </>
              ) : userRole === 'RIDER' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-primary/40 bg-gradient-to-br from-primary-container to-secondary-container text-white shadow-md hover:-translate-y-px transition-transform"
                  >
                    <Navigation2 className="w-4 h-4" /> Rider Dashboard
                  </Link>
                  <Link
                    href="/rides/find"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <Search className="w-4 h-4" /> Find Available Rides
                  </Link>
                  <Link
                    href="/rides/requests"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <FileText className="w-4 h-4" /> My Ride Requests
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-primary/40 bg-gradient-to-br from-primary-container to-secondary-container text-white shadow-md hover:-translate-y-px transition-transform"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-white/14 bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all"
                  >
                    <UserPlus className="w-4 h-4" /> Create Student Account
                  </Link>
                  <button
                    onClick={() => openInstall('mac')}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-px transition-all"
                  >
                    <Download className="w-4 h-4" /> Install Web App
                  </button>
                </>
              )}
            </CardBody>
          </Card>
        </section>
      </main>

      <Footer />

      {/* Center-Positioned Install App Modal via React Portal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        initialPlatform={installPlatform}
      />
    </div>
  );
}
