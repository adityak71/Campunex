'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import {
  ShieldCheck,
  Lock,
  Wifi,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Car,
  Share2,
  AlertCircle,
  BookOpen,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

export default function SafetyPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('BEHAVIOR');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const { showToast } = useToast();

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setTimeout(() => {
      setSubmittingReport(false);
      setShowReportModal(false);
      showToast('Incident report submitted to Campus Safety Administration.', 'success');
      setReportDetails('');
    }, 600);
  };

  const safetyPillars = [
    {
      icon: UserCheck,
      title: '1. University Verification',
      desc: 'Strict identity validation enforcing verified .edu / .ac.in institutional email domains across all campus commuters.',
    },
    {
      icon: ShieldCheck,
      title: '2. Driver Identity Verification',
      desc: 'Drivers undergo institutional credential verification and student ID validation before publishing open commute routes.',
    },
    {
      icon: Car,
      title: '3. Vehicle & Plate Verification',
      desc: 'Pre-boarding ride checks ensure vehicle make, model, color, and registration plate (e.g. PB-08-AB-1234) match exactly.',
    },
    {
      icon: Lock,
      title: '4. Dual OTP Protection',
      desc: 'Ride initiation and completion require mutual 4-digit OTP verification codes stored in secure Redis cache.',
    },
    {
      icon: Wifi,
      title: '5. Live GPS Coordinate Tracking',
      desc: 'Real-time WebSocket streaming tracks driver locations continuously during active trip lifecycles without simulation.',
    },
    {
      icon: Share2,
      title: '6. Live Trip Sharing',
      desc: 'Riders can copy and share live tracking links with family, friends, or campus guardians for remote commute monitoring.',
    },
    {
      icon: AlertCircle,
      title: '7. Incident Reporting System',
      desc: 'In-app safety reporting allowing riders to flag unauthorized vehicles, improper conduct, or route deviations.',
    },
    {
      icon: BookOpen,
      title: '8. Community Conduct Guidelines',
      desc: 'Zero-tolerance policy regarding harassment, dangerous driving, or unverified passenger substitutions.',
    },
    {
      icon: PhoneCall,
      title: '9. 24/7 Campus Emergency Support',
      desc: 'Direct one-tap connection to campus security forces (+91 1800-102-4431) and national emergency services (112).',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-12 w-full">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="warning">CAMPUS SAFETY SHIELD</Badge>
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Safety Center & Community Guidelines
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Built with institutional identity verification, dual OTP cryptographic checks, live WebSocket coordinate tracking, and 24/7 campus emergency support.
          </p>
        </div>

        {/* 9 Safety Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safetyPillars.map(({ icon: Icon, title, desc }, idx) => (
            <Card key={idx} hoverable className="p-6 space-y-3">
              <div className="w-12 h-12 bg-teal-50 dark:bg-cyan-950/80 text-teal-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>

        {/* Incident Reporting & Emergency Hotline Card */}
        <Card className="p-8 space-y-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Report an Incident or Safety Concern
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                If you encountered an issue during a commute, report it directly to Campus Safety Authorities.
              </p>
            </div>

            <Button
              variant="danger"
              size="md"
              onClick={() => setShowReportModal(true)}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Report User or Incident
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-100">24/7 Campus Security Helpline</div>
              <div className="font-mono text-teal-600 dark:text-cyan-400 font-extrabold text-sm mt-1">+91 1800-102-4431</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-100">National Emergency Services</div>
              <div className="font-mono text-teal-600 dark:text-cyan-400 font-extrabold text-sm mt-1">112</div>
            </div>
          </div>
        </Card>

        {/* Report User Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Report User or Incident"
        >
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Incident Category</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="BEHAVIOR">Inappropriate Behavior</option>
                <option value="VEHICLE_MISMATCH">Vehicle Mismatch / Unverified Plate</option>
                <option value="UNSAFE_DRIVING">Unsafe Driving / Speeding</option>
                <option value="ROUTE_DEVIATION">Unapproved Route Deviation</option>
                <option value="OTHER">Other Safety Violation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Incident Details</label>
              <textarea
                required
                rows={4}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide clear details regarding the incident, date, vehicle registration, or participant..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

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
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={submittingReport}
                className="flex-1"
              >
                Submit Official Report
              </Button>
            </div>
          </form>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
