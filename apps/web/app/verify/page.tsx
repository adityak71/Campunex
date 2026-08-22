'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { ShieldCheck, Mail, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/auth/verify-institution', {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });

      showToast('University email verified successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      const errMsg = err.message || 'OTP verification failed';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendTimer(30); // Optimistically start timer
      await apiRequest('/auth/resend-otp', {
        method: 'POST',
      });
      showToast('A new 6-digit verification OTP has been sent to your email', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend OTP', 'error');
      setResendTimer(0); // Reset timer on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-teal-50 dark:bg-cyan-950/80 text-teal-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Verify University Email
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Enter the 6-digit verification OTP sent to your campus email address
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800 py-3">
              <span>Didn't receive code?</span>
              {resendTimer > 0 ? (
                <span className="font-mono text-slate-400">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-teal-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend OTP
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              isLoading={loading}
              disabled={otp.length !== 6}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify & Activate Account
            </Button>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
