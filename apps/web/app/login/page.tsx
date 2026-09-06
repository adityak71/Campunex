'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

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

        const role = res.user?.role?.toUpperCase();
        if (role === 'DRIVER') {
          router.push('/driver');
        } else if (role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-[600px] p-8 md:p-10 !rounded-[26px]">
          <CardBody className="!p-0 space-y-8">
            
            {/* Header Area */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-[600] text-white/80 mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent1 shadow-[0_0_8px_rgba(181,108,255,0.6)]"></span>
                  Access
                </div>
                <h1 className="text-3xl font-[900] tracking-tight text-white mb-2">Sign in</h1>
                <p className="text-sm text-white/60">Access your dashboard and trip updates.</p>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="!rounded-full text-white/70 hover:text-white border-white/10">
                  Back to site
                </Button>
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" variant="primary" isLoading={loading} className="px-8 !rounded-xl">
                  Sign in
                </Button>
                <Link href="/forgot-password">
                  <Button type="button" variant="ghost" className="!rounded-xl border-white/10 text-white/80">
                    Forgot password
                  </Button>
                </Link>
              </div>
            </form>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-sm text-white/60">
              New here? 
              <Link href="/register">
                <Button variant="ghost" size="sm" className="!rounded-full border-white/10 text-white/80 hover:text-white">
                  Create an account
                </Button>
              </Link>
            </div>
            
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
