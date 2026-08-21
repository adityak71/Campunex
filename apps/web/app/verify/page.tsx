'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiRequest } from '../../lib/api';
import { Shield, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const hint = sessionStorage.getItem('dev_otp');
    if (hint) {
      setDevOtpHint(hint);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/verify-institution', {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });

      if (res.token) {
        localStorage.setItem('campunex_token', res.token);
        sessionStorage.removeItem('dev_otp');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto text-teal-600">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] tracking-tight">
              Verify Campus Email
            </h1>
            <p className="text-xs text-slate-500">
              Enter the 6-digit verification code sent to your campus email address
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {devOtpHint && (
            <div className="p-3 bg-[#e0f2fe]/60 border border-[#bae6fd] rounded-xl text-xs flex justify-between items-center text-[#1e3a8a]">
              <span>Dev Verification OTP: <strong>{devOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setOtp(devOtpHint)}
                className="px-2.5 py-1 bg-[#1e3a8a] hover:bg-[#1d3271] text-white rounded-lg text-[10px] font-bold shadow-sm"
              >
                Auto Fill
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1d3271] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify Campus Identity'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
