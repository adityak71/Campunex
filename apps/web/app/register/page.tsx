'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';

export default function RegisterPage() {
  const [institutions, setInstitutions] = useState<any[]>([
    { id: 'default-lpu', name: 'Lovely Professional University', email_domain: 'lpu.in' },
    { id: 'default-state', name: 'State University Campus', email_domain: 'college.edu' },
    { id: 'default-nit', name: 'National Institute of Tech', email_domain: 'nit.ac.in' },
  ]);
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [emailUsername, setEmailUsername] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    role: 'RIDER' as 'RIDER' | 'DRIVER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Dynamically fetch approved universities from Admin-controlled backend
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const res = await apiRequest('/auth/institutions');
        if (res.institutions && res.institutions.length > 0) {
          setInstitutions(res.institutions);
          setSelectedInstId(res.institutions[0].id);
        } else {
          setSelectedInstId('default-lpu');
        }
      } catch (err) {
        setSelectedInstId('default-lpu');
      }
    }
    fetchUniversities();
  }, []);

  const currentInstitution =
    institutions.find((i) => i.id === selectedInstId) || institutions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentInstitution) {
      setError('Please select an approved university/campus first.');
      return;
    }

    // Clean username (strip any accidental @domain typed by user)
    const rawUsername = emailUsername.trim().toLowerCase();
    const cleanUsername = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername;

    if (!cleanUsername) {
      setError('Please enter your university email username or student roll number.');
      return;
    }

    const fullEmail = `${cleanUsername}@${currentInstitution.email_domain.toLowerCase()}`;

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        name: fullName || formData.firstName.trim() || 'Campus User',
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: fullEmail,
        password: formData.password,
        role: formData.role,
        university: currentInstitution.name,
        institutionId: currentInstitution.id.startsWith('default-') ? undefined : currentInstitution.id,
      };

      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.token) {
        localStorage.setItem('campunex_token', res.token);
      }

      showToast('Account created! Please verify your university email.', 'success');
      router.push(`/verify?email=${encodeURIComponent(fullEmail)}`);
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed';
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
        <Card className="w-full max-w-[620px] p-8 md:p-10 !rounded-[26px]">
          <CardBody className="!p-0 space-y-7">
            
            {/* Header Area */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-[600] text-white/80 mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent1 shadow-[0_0_8px_rgba(181,108,255,0.6)]"></span>
                  Campus Network
                </div>
                <h1 className="text-3xl font-[900] tracking-tight text-white mb-2">Create account</h1>
                <p className="text-sm text-white/60">Connect with your official university email domain.</p>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="!rounded-full text-white/70 hover:text-white border-white/10">
                  Back to site
                </Button>
              </Link>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-white/90">I want to join as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'RIDER' })}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      formData.role === 'RIDER'
                        ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(208,188,255,0.25)] ring-1 ring-primary'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎒</span>
                      <span className="font-bold text-sm text-white">Rider</span>
                    </div>
                    <span className="text-[11px] text-white/60">Find & share campus rides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'DRIVER' })}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      formData.role === 'DRIVER'
                        ? 'border-secondary bg-secondary/20 text-white shadow-[0_0_15px_rgba(192,193,255,0.25)] ring-1 ring-secondary'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🚗</span>
                      <span className="font-bold text-sm text-white">Driver</span>
                    </div>
                    <span className="text-[11px] text-white/60">Publish routes & offer seats</span>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-white/90">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                    placeholder="Aditya"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-white/90">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                    placeholder="Kumar"
                  />
                </div>
              </div>

              {/* Step 1: Select University BEFORE email */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-white/90">Select College / University</label>
                  <span className="text-[11px] text-accent1 font-medium">Domain Verified</span>
                </div>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all cursor-pointer"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                      {inst.name} (@{inst.email_domain})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-white/50">
                  Select your campus. The email domain below will automatically lock to this institution.
                </p>
              </div>

              {/* Step 2: Email Username with Fixed Domain Badge */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Institutional Email</label>
                <div className="relative flex items-center rounded-xl bg-white/5 border border-white/10 focus-within:border-accent1/50 focus-within:ring-1 focus-within:ring-accent1/50 transition-all">
                  <input
                    type="text"
                    value={emailUsername}
                    onChange={(e) => setEmailUsername(e.target.value)}
                    required
                    className="flex-1 bg-transparent py-3 pl-4 pr-2 text-white focus:outline-none placeholder:text-white/20 text-sm"
                    placeholder="University Email Id Without @"
                  />
                  <div className="pr-3 pl-1 flex items-center">
                    <span className="px-2.5 py-1 rounded-lg bg-accent1/20 border border-accent1/30 text-xs font-mono font-bold text-white select-none">
                      @{currentInstitution?.email_domain || 'university.edu'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-white/40">
                  Example preview:{' '}
                  <span className="font-mono text-cyan-300">
                    {(emailUsername.trim().split('@')[0] || 'your-university-email')}@{currentInstitution?.email_domain || 'lpu.in'}
                  </span>
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm"
                  placeholder="Create a strong password (min 6 characters)"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={loading} className="w-full !rounded-xl py-3.5 font-bold">
                  Create account & Continue
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3 pt-3 border-t border-white/10 text-sm text-white/60">
              Already have an account?
              <Link href="/login">
                <Button variant="ghost" size="sm" className="!rounded-full border-white/10 text-white/80 hover:text-white">
                  Sign in
                </Button>
              </Link>
            </div>
            
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
