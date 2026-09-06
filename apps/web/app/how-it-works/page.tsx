'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { UserCheck, MapPin, Users, Navigation2, ArrowRight } from 'lucide-react';

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
      desc: 'Set your daily pickup landmark and destination. Real-time address geocoding converts addresses to spatial coordinates.',
    },
    {
      step: '03',
      icon: Users,
      title: '500m Route Match Engine',
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
    <div className="min-h-screen text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="info">SIMPLE 4-STEP PROCESS</Badge>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            How Campunex Works
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            Connecting verified university commuters who share similar routes with zero pricing pressure and 100% spatial transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-white/5 border border-white/10 p-8 rounded-[22px] space-y-4 transition-all hover:border-accent3/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-white/10 border border-white/20 text-accent3 rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold text-accent3 font-mono">
                  {step}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[22px] p-8 text-center space-y-4">
          <h2 className="text-2xl font-extrabold">Ready to find your campus ride?</h2>
          <p className="text-xs text-white/60 max-w-lg mx-auto">
            Join thousands of verified university students commuting safely every day.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
