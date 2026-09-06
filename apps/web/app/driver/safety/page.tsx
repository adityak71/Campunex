'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import {
  ShieldCheck,
  Lock,
  Radio,
  Car,
  AlertTriangle,
  HelpCircle,
  FileText,
  PhoneCall,
  CheckCircle2,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function DriverSafetyPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  return (
    <WorkspaceLayout mode="driver" title="Safety Center" subtitle="Campus security features and emergency contacts">
      <div className="space-y-8 w-full">
        {/* Header */}
        <div className="space-y-1">
          <Badge variant="info">TRUST & SAFETY PROTOCOLS</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Campus Driver Safety Center
          </h1>
          <p className="text-xs text-white/60">
            Campunex enforces strict multi-layered security protocols to keep institutional drivers and passengers safe
          </p>
        </div>

        {/* Emergency Call Banner */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
          <div className="space-y-1">
            <div className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Campus Emergency Response
            </div>
            <div className="text-xl font-black">24/7 Security & Support Helpline</div>
            <p className="text-xs text-white/60">
              Immediate assistance for vehicle breakdowns, suspicious incidents, or emergency support.
            </p>
          </div>

          <div className="flex gap-3">
            <a href="tel:+9118001024431">
              <Button variant="outline" size="md" leftIcon={<PhoneCall className="w-4 h-4 text-danger" />}>
                Call +91 1800-102-4431
              </Button>
            </a>
          </div>
        </div>

        {/* 4 Pillars of Safety Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Verify Rider */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-accent3 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white">
              1. Institutional Rider Verification
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Every rider on Campunex must verify their official university email domain (`.edu` / `.ac.in`). You only offer rides to verified members of your campus community.
            </p>
          </div>

          {/* 2. Dual OTP Security */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-accent3 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white">
              2. Dual 4-Digit OTP Protection
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Initiation and completion codes require the rider to physically share their 4-digit code with you upon pickup and dropoff. No ride can start without mutual verification.
            </p>
          </div>

          {/* 3. Live Socket.IO GPS Stream */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-accent3 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white">
              3. Real-Time GPS Tracking
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Active trips stream live spatial coordinates via Socket.IO and Redis cache. Campus administration and emergency systems monitor active route progress.
            </p>
          </div>

          {/* 4. Vehicle Verification */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-accent3 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-white">
              4. Registered Vehicle Identification
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              All vehicles, registration numbers, and colors are logged in our database and matched with official campus parking permits for zero unauthorized access.
            </p>
          </div>
        </div>

        {/* Quick Links & Reporting */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[22px] space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Safety Resources & Community Guidelines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link href="/help" className="p-4 bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100 transition font-bold">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent3" /> Help Center
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-4 bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100 transition font-bold text-left"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Report Incident
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <div className="p-4 bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent3" /> Guidelines
              </span>
              <Badge variant="verified">Compliant</Badge>
            </div>
          </div>
        </div>

        {/* Incident Reporting Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Report Safety Incident or Issue"
        >
          {reportSuccess ? (
            <div className="space-y-4 text-xs text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-accent2 mx-auto" />
              <p className="font-bold text-white">
                Incident report submitted to Campus Security team.
              </p>
              <Button variant="primary" size="sm" onClick={() => { setShowReportModal(false); setReportSuccess(false); }}>
                Done
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setReportSuccess(true);
              }}
              className="space-y-4 text-xs"
            >
              <p className="text-white/60">
                Describe any unsafe behavior, no-show incidents, or vehicle issues during your commute:
              </p>

              <textarea
                required
                rows={4}
                placeholder="Provide details about the incident..."
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent1/50"
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" className="flex-1">
                  Submit Report
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </WorkspaceLayout>
  );
}
