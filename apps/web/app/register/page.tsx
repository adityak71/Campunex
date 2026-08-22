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
import { User, UserRole } from '@campunex/shared';
import { Navigation2, Mail, Lock, User as UserIcon, Building, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('RIDER');
  const [institutionName, setInstitutionName] = useState('Lovely Professional University');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          institution_name: institutionName,
        }),
      });

      if (res.token) {
        localStorage.setItem('campunex_token', res.token);
        showToast('Registration successful! Please verify your email.', 'success');
        router.push('/verify');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed';
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
        <Card className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#1e3a8a] dark:bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Navigation2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Create Your Campus Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Use your official university email domain (.edu or .in) to join your campus commute network
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
            />

            <Input
              label="University Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@lpu.in"
              helperText="Must be an official .edu or .in campus domain"
            />

            <Input
              label="Password"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />

            <Input
              label="University Name"
              type="text"
              required
              leftIcon={<Building className="w-4 h-4 text-slate-400" />}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Lovely Professional University"
            />

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Account Commute Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('RIDER')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    role === 'RIDER'
                      ? 'bg-[#e0f2fe] dark:bg-cyan-950/80 border-teal-500 text-[#1e3a8a] dark:text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🚴 Rider (Passenger)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DRIVER')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    role === 'DRIVER'
                      ? 'bg-[#e0f2fe] dark:bg-cyan-950/80 border-teal-500 text-[#1e3a8a] dark:text-cyan-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🚘 Driver (Offer Seats)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register Campus Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 dark:text-cyan-400 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
