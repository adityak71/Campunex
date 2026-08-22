'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { Navigation2, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('driver@lpu.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        localStorage.setItem('campunex_token', res.token);
        showToast('Login successful! Redirecting...', 'success');
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Invalid credentials or connection error';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#1e3a8a] dark:bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Navigation2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Welcome Back to Campunex
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to access your campus rides & 500m route matching
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email (.edu / .in)"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@lpu.in"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex justify-between items-center text-xs">
              <span />
              <Link href="/forgot-password" className="text-teal-600 dark:text-cyan-400 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Quick Demo Selectors */}
            <div className="p-3 bg-[#e0f2fe]/60 dark:bg-cyan-950/40 rounded-xl border border-[#bae6fd] dark:border-cyan-800 text-xs space-y-1">
              <div className="font-bold text-[#1e3a8a] dark:text-cyan-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" /> Demo Quick Select:
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setEmail('driver@lpu.in'); setPassword('password123'); }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-[#1e3a8a] dark:text-cyan-300 text-[11px] shadow-sm transition"
                >
                  🚘 Demo Driver
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('rider@lpu.in'); setPassword('password123'); }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-[#1e3a8a] dark:text-cyan-300 text-[11px] shadow-sm transition"
                >
                  🚴 Demo Rider
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-600 dark:text-cyan-400 hover:underline font-bold">
              Create student account
            </Link>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
