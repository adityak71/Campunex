'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { apiRequest } from '../../lib/api';

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mx-auto text-xl">
              🎓
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Verify Institutional Identity
            </h1>
            <p className="text-sm text-slate-400">
              Enter the 6-digit verification code sent to your campus email
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {devOtpHint && (
            <div className="p-3 bg-cyan-950/60 border border-cyan-800 rounded-lg text-cyan-300 text-xs flex justify-between items-center">
              <span>Dev OTP Hint: <strong>{devOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setOtp(devOtpHint)}
                className="px-2 py-0.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded text-[10px] font-bold"
              >
                Auto Fill
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-cyan-500 transition"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Verifying...' : 'Verify Campus Identity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
