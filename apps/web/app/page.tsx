'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card, { CardHead, CardBody } from '../components/ui/Card';
import {
  Navigation2,
  ShieldCheck,
  MapPin,
  Users,
  Car,
  Search,
  Settings,
  FileText
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pb-[34px]">
        {/* HERO SECTION */}
        <section className="max-w-[1180px] mx-auto px-4 md:px-6 pt-[44px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-[10px] py-[6px] rounded-full border border-white/16 bg-white/[0.07] text-[12px] font-[900] text-white/86 mb-6">
                <span className="w-[8px] h-[8px] rounded-full bg-accent1"></span>
                Premium campus rides, verified & scheduled
              </div>
              
              <h1 className="text-[48px] md:text-[64px] font-[950] tracking-[-0.03em] leading-[1.05] text-white mb-5">
                Your campus.<br/>Your route.<br/>Your ride.
              </h1>
              
              <p className="text-[17px] text-white/60 font-[500] leading-relaxed max-w-lg mb-8">
                Campunex helps students coordinate rides with trusted verification, real-time alerts, and
                clean workflows for riders, drivers, and campus admins.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link href="/register" className="inline-flex items-center justify-center font-[800] text-[13.5px] px-[14px] py-[11px] rounded-full border border-accent1/45 bg-gradient-to-br from-accent1/[0.95] to-accent2/[0.95] text-white shadow-[0_14px_40px_rgba(76,125,255,0.25)] hover:-translate-y-px transition-transform">
                  Create an account
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center justify-center font-[800] text-[13.5px] px-[14px] py-[11px] rounded-full border border-white/20 bg-transparent text-white/90 hover:bg-white/10 transition-colors">
                  See how it works
                </Link>
                <span className="text-[12px] text-white/50 font-[600] ml-2 hidden sm:block">
                  Use paths like <span className="px-1.5 py-0.5 rounded-md bg-black/30 border border-white/10 font-mono text-[11px]">/dashboard</span>
                </span>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="!p-0">
                  <CardBody>
                    <div className="text-[15px] font-[900] text-white/90 mb-1">Verified communities</div>
                    <div className="text-[12px] text-white/60 leading-relaxed">University domain + optional ID checks for safer coordination.</div>
                  </CardBody>
                </Card>
                <Card className="!p-0">
                  <CardBody>
                    <div className="text-[15px] font-[900] text-white/90 mb-1">Fast scheduling</div>
                    <div className="text-[12px] text-white/60 leading-relaxed">Create rides, manage seats, and message in one flow.</div>
                  </CardBody>
                </Card>
                <Card className="!p-0">
                  <CardBody>
                    <div className="text-[15px] font-[900] text-white/90 mb-1">Operational visibility</div>
                    <div className="text-[12px] text-white/60 leading-relaxed">Admins get reports, flags, and verification queues.</div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Device Stack Visual */}
            <div className="relative h-[420px] hidden md:block" aria-hidden="true">
              {/* Device 3 (Back) */}
              <div className="absolute right-0 w-[95%] max-w-[440px] rounded-[26px] border border-white/16 bg-gradient-to-b from-white/[0.12] to-white/[0.06] shadow-glass-lg backdrop-blur-[18px] overflow-hidden origin-right" style={{ top: '90px', transform: 'rotate(-8deg)', opacity: 0.55 }}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <strong className="text-white/85 text-sm">Dashboard</strong>
                  <span className="px-2.5 py-1 rounded-full border border-white/16 bg-white/[0.07] text-[11px] font-bold text-white/80">Today</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Active requests</span><strong className="text-white">3</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Upcoming trips</span><strong className="text-white">2</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Alerts</span><strong className="text-white">1</strong>
                  </div>
                  <div className="h-4"></div>
                  <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-accent1 w-[78%] rounded-full"></div>
                  </div>
                  <div className="text-[11px] text-white/50 pt-1">Weekly reliability score</div>
                </div>
              </div>

              {/* Device 2 (Middle) */}
              <div className="absolute right-0 w-[95%] max-w-[440px] rounded-[26px] border border-white/16 bg-gradient-to-b from-white/[0.12] to-white/[0.06] shadow-glass-lg backdrop-blur-[18px] overflow-hidden origin-right" style={{ top: '50px', transform: 'rotate(-3deg)', opacity: 0.75 }}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <strong className="text-white/80 text-sm">Driver</strong>
                  <span className="px-2.5 py-1 rounded-full border border-accent3/20 bg-accent3/10 text-[11px] font-bold text-accent3">Verified</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Seats available</span><strong className="text-white">2</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">ETA to pickup</span><strong className="text-white">7 min</strong>
                  </div>
                </div>
              </div>

              {/* Device 1 (Front) */}
              <div className="absolute right-0 w-[95%] max-w-[440px] rounded-[26px] border border-white/16 bg-gradient-to-b from-white/[0.12] to-white/[0.06] shadow-glass-lg backdrop-blur-[18px] overflow-hidden origin-right" style={{ top: '10px', transform: 'rotate(3deg)', opacity: 1 }}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <strong className="text-white/80 text-sm">Trip</strong>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent2/20 bg-accent2/10 text-[11px] font-bold text-accent2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse"></span>
                    Live
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Pickup: North Gate</span><strong className="text-white">6:15 PM</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Dropoff: Main Library</span><strong className="text-white">6:32 PM</strong>
                  </div>
                  <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden my-3">
                    <div className="h-full bg-accent2 w-[45%] rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[12px] bg-black/25 text-[12.5px]">
                    <span className="text-white/60">Safety check-in</span><strong className="text-accent3">Enabled</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-[80px]"></div>

        {/* QUICK ENTRY POINTS */}
        <section className="max-w-[1180px] mx-auto px-4 md:px-6">
          <Card className="!p-0 border-white/10 bg-white/[0.03]">
            <CardHead className="border-white/5">
              <strong className="text-[14px] text-white/90">Quick entry points</strong>
              <span className="text-[12px] text-white/50 font-[600]">Same UI language everywhere (glass + gradient)</span>
            </CardHead>
            <CardBody className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] font-[800] text-[13.5px] border border-accent1/45 bg-gradient-to-br from-accent1/[0.95] to-accent2/[0.95] text-white shadow-md hover:-translate-y-px transition-transform">
                <Navigation2 className="w-4 h-4" /> Rider dashboard
              </Link>
              <Link href="/driver" className="inline-flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] font-[800] text-[13.5px] border border-stroke bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all">
                <Car className="w-4 h-4" /> Driver
              </Link>
              <Link href="/admin" className="inline-flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] font-[800] text-[13.5px] border border-stroke bg-white/[0.08] text-white hover:bg-white/10 hover:-translate-y-px transition-all">
                <Settings className="w-4 h-4" /> Admin
              </Link>
              <Link href="/trips" className="inline-flex items-center gap-2 px-[14px] py-[12px] rounded-[14px] font-[800] text-[13.5px] border border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:-translate-y-px transition-all">
                <FileText className="w-4 h-4" /> Ride details
              </Link>
            </CardBody>
          </Card>
        </section>
        
        <div className="h-[60px]"></div>
      </main>

      <Footer />
    </div>
  );
}
