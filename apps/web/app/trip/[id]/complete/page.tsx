'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';
import Skeleton from '../../../../components/ui/Skeleton';
import { useToast } from '../../../../components/ui/Toast';
import { apiRequest } from '../../../../lib/api';
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Home,
  Check,
  Car,
  Navigation2
} from 'lucide-react';

export default function DriverCompleteOtpPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();
  const { showToast } = useToast();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true);
        const res = await apiRequest(`/trips/${tripId}`);
        setTrip(res.trip);
        if (res.trip.status === 'COMPLETED') {
          setIsCompleted(true);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load trip', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripId]);

  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 3) {
      const nextInput = document.getElementById(`complete-otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`complete-otp-digit-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRequestCompletionOtp = async () => {
    setErrorMessage(null);
    setRequestingOtp(true);
    try {
      const res = await apiRequest(`/trips/${tripId}/completion-otp`, { method: 'POST' });
      if (res.devOtp) setDevOtp(res.devOtp);
      showToast('🔑 Completion OTP generated & sent to Rider!', 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to request Completion OTP';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyCompletionOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 4) {
      setErrorMessage('Please enter the complete 4-digit OTP code.');
      return;
    }

    if (attempts >= 5) {
      setErrorMessage('Too many failed attempts. Security cooldown active. Request a new OTP code.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await apiRequest(`/trips/${tripId}/verify-completion-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: fullOtp }),
      });

      setIsCompleted(true);
      showToast('🎉 Trip completed successfully!', 'success');
    } catch (err: any) {
      setAttempts((prev) => prev + 1);
      const msg = err.message || 'Incorrect Completion OTP. Please verify with the rider.';
      if (msg.toLowerCase().includes('expired')) {
        setErrorMessage('OTP code has expired. Please click "Request New OTP" to generate a fresh code.');
      } else {
        setErrorMessage(msg);
      }
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-12 flex-1 space-y-6 w-full">
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const isInputComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-12 flex-1 w-full space-y-6">
        {/* Navigation Back */}
        <Link
          href={`/trip/${tripId}`}
          className="text-xs font-bold text-slate-500 hover:text-teal-600 dark:hover:text-cyan-400 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Navigation Map
        </Link>

        {isCompleted ? (
          /* SUCCESS VIEW: Trip Completed Successfully */
          <Card className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <Badge variant="success">TRIP COMPLETED</Badge>
              <h1 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Trip completed successfully
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto pt-1">
                Your commute record has been permanently verified and logged into PostgreSQL & PostGIS.
              </p>
            </div>

            {/* Trip Summary Card */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-3">
              <h3 className="font-extrabold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2">
                📋 Verified Trip Summary
              </h3>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Rider:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{trip.rider_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Driver:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{trip.driver_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Origin Landmark:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{trip.origin_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Destination Landmark:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{trip.destination_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Completed At:</span>
                  <strong className="text-teal-600 dark:text-teal-400">{new Date().toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* CTA Back to Dashboard */}
            <Button
              variant="teal"
              size="lg"
              className="w-full"
              onClick={() => router.push('/driver')}
              leftIcon={<Home className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          /* INPUT VIEW: 4-Digit Completion OTP Screen */
          <Card className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-teal-200 dark:border-teal-800">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <Badge variant="verified">STEP 2: RIDE COMPLETION</Badge>
              <h1 className="text-2xl font-extrabold text-[#1e3a8a] dark:text-cyan-300">
                Trip Completion OTP Verification
              </h1>
              {/* Guidance Message */}
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-sm mx-auto pt-1">
                "Ask the rider for their completion OTP after reaching the destination."
              </p>
            </div>

            {/* Rider & Destination Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rider Name:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{trip.rider_name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Destination Landmark:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{trip.destination_name}</strong>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 4-Digit Monospaced Box Input Form */}
            <form onSubmit={handleVerifyCompletionOtp} className="space-y-6">
              <div className="flex justify-center items-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`complete-otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-16 text-center font-mono text-2xl font-extrabold bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-teal-500 focus:ring-2 focus:ring-teal-400 focus:outline-none transition-all text-slate-900 dark:text-slate-100 shadow-sm"
                  />
                ))}
              </div>

              {/* Dev Demo Mode OTP Code Helper */}
              {devOtp && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-bold">
                  🔑 Generated Completion OTP: <span className="font-mono text-base">{devOtp}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleRequestCompletionOtp}
                  isLoading={requestingOtp}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Request Rider OTP
                </Button>

                <Button
                  type="submit"
                  variant="teal"
                  size="md"
                  isLoading={submitting}
                  disabled={!isInputComplete || attempts >= 5}
                  rightIcon={<Check className="w-4 h-4" />}
                  className="flex-1"
                >
                  Verify & Complete
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
