'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card, { CardHead, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import {
  ShieldCheck,
  Lock,
  Wifi,
  UserCheck,
  CheckCircle2,
  Car,
  Share2,
  AlertCircle,
  BookOpen,
  PhoneCall,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function SafetyPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('BEHAVIOR');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const { showToast } = useToast();

  const [reporterEmail, setReporterEmail] = useState('');

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await apiRequest('/support/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Safety Incident Report',
          email: reporterEmail || 'anonymous@campunex.com',
          issueType: `SAFETY ALERT: ${reportCategory}`,
          message: reportDetails
        })
      });
      showToast('Incident report submitted to Campus Safety Administration', 'success');
      setReportDetails('');
      setReporterEmail('');
      setShowReportModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pb-[60px]">
        {/* HERO SECTION */}
        <section className="max-w-[1180px] mx-auto px-4 md:px-6 pt-[44px] mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-[10px] py-[6px] rounded-full border border-white/16 bg-white/[0.07] text-[12px] font-[900] text-white/86 mb-6">
            <span className="w-[8px] h-[8px] rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            Campus Safety Shield
          </div>
          
          <h1 className="text-[40px] md:text-[56px] font-[950] tracking-[-0.03em] leading-[1.05] text-white mb-5">
            Your Safety is Our Priority
          </h1>
          <p className="text-[17px] text-white/60 font-[500] leading-relaxed max-w-2xl mx-auto mb-10">
            Campunex is built on trust, identity verification, and strict institutional security. Discover our emergency protocols, community guidelines, and built-in safety features.
          </p>

          <Button variant="danger" size="lg" onClick={() => setShowReportModal(true)} className="shadow-[0_10px_40px_rgba(239,68,68,0.25)]" leftIcon={<AlertTriangle className="w-5 h-5" />}>
            Report an Incident Now
          </Button>
        </section>

        <section className="max-w-[1180px] mx-auto px-4 md:px-6 space-y-12">
          
          {/* SECTION 1: EMERGENCY PROTOCOLS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1 relative rounded-[26px] overflow-hidden border border-white/10 bg-white/5 p-4 aspect-video flex items-center justify-center shadow-glass-lg">
               <Image src="/images/safety_emergency.jpg" alt="Emergency Protocol" fill className="object-cover opacity-80" />
            </div>
            <div className="order-1 lg:order-2 space-y-5">
              <Badge variant="info" className="mb-2">Emergency Protocols</Badge>
              <h2 className="text-3xl font-[900] text-white tracking-tight">What to do in an emergency?</h2>
              <p className="text-white/60 text-[15px] leading-relaxed">
                If you ever feel unsafe, threatened, or if there is a medical emergency during a ride, do not hesitate. Your immediate safety is paramount.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Call National Services (112)</strong>
                    <span className="text-white/50 text-sm">Dial 112 for Police, Ambulance, or Fire emergencies instantly.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-accent1/20 text-accent1 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-white mb-1">Campus Security</strong>
                    <span className="text-white/50 text-sm">If on or near campus, dial the 24/7 University Security helpline.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* SECTION 2: LIVE LOCATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <Badge variant="warning" className="mb-2">Live Tracking</Badge>
              <h2 className="text-3xl font-[900] text-white tracking-tight">Share your live location</h2>
              <p className="text-white/60 text-[15px] leading-relaxed">
                Every Campunex ride is monitored via real-time WebSocket GPS tracking. Always use the built-in share feature to keep someone you trust informed.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent1" /> Share tracking link with family or friends via WhatsApp.
                </li>
                <li className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent1" /> Tracking links automatically expire when the trip ends.
                </li>
                <li className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent1" /> Never ride off-platform; trips must be tracked inside the app.
                </li>
              </ul>
            </div>
            <div className="relative rounded-[26px] overflow-hidden border border-white/10 bg-white/5 p-4 aspect-video flex items-center justify-center shadow-glass-lg">
               <Image src="/images/safety_location.jpg" alt="Live Location Tracking" fill className="object-cover opacity-80" />
            </div>
          </div>

          {/* SECTION 3: DO'S AND DON'TS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
             <div className="order-2 lg:order-1 relative rounded-[26px] overflow-hidden border border-white/10 bg-white/5 p-4 aspect-video flex items-center justify-center shadow-glass-lg">
               <Image src="/images/safety_rules.jpg" alt="Rules & Conduct" fill className="object-cover opacity-80" />
            </div>
            <div className="order-1 lg:order-2 space-y-5">
              <Badge variant="info" className="mb-2">Community Guidelines</Badge>
              <h2 className="text-3xl font-[900] text-white tracking-tight">Do's and Don'ts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="space-y-3">
                  <strong className="text-green-400 flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5"/> Always Do</strong>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-white/80">Verify the license plate matches before entering.</div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-white/80">Ask the driver "Who are you picking up?" to verify.</div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-white/80">Share your live trip status with a friend.</div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-white/80">Wear your seatbelt and helmet.</div>
                </div>
                <div className="space-y-3">
                  <strong className="text-red-400 flex items-center gap-2 mb-4"><XCircle className="w-5 h-5"/> Never Do</strong>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-white/80">Board a vehicle with a different driver or plate.</div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-white/80">Share your OTP before physically meeting.</div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-white/80">Accept offline cash rides outside the app.</div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-white/80">Share personal contact details unnecessarily.</div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      <Footer />

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report an Incident">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2">Your Email (optional)</label>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent1 transition"
              placeholder="For follow-up updates"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2">Issue Category</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent1 transition"
            >
              <option className="bg-slate-900 text-white" value="BEHAVIOR">Inappropriate Behavior</option>
              <option className="bg-slate-900 text-white" value="VEHICLE">Wrong Vehicle / Driver</option>
              <option className="bg-slate-900 text-white" value="DRIVING">Dangerous Driving</option>
              <option className="bg-slate-900 text-white" value="OTHER">Other Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2">Details</label>
            <textarea
              required
              rows={4}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent1 transition"
              placeholder="Please provide specifics (time, location, what happened)..."
            />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="danger" className="w-full" disabled={submittingReport}>
              {submittingReport ? 'Submitting...' : 'Submit Report Confidentially'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
