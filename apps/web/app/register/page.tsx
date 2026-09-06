'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { apiRequest } from '../../lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    university: 'Lovely Professional University',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.token) {
        localStorage.setItem('campunex_token', res.token);
        showToast('Registration successful!', 'success');
        
        // Always redirect to dashboard, role might be default RIDER initially
        router.push('/dashboard');
      } else {
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
                <h1 className="text-3xl font-[900] tracking-tight text-white mb-2">Create account</h1>
                <p className="text-sm text-white/60">Join with your campus email for verification.</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-white/90">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                    placeholder="Ava"
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
                    placeholder="Nguyen"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                  placeholder="ava@university.edu"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20"
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-white/90">University</label>
                <select
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all appearance-none"
                >
                  <option className="bg-slate-900 text-white" value="">Select...</option>
                  <option className="bg-slate-900 text-white" value="Lovely Professional University">Lovely Professional University</option>
                  <option className="bg-slate-900 text-white" value="Chandigarh University">Chandigarh University</option>
                  <option className="bg-slate-900 text-white" value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={loading} className="w-full !rounded-xl py-3.5">
                  Create account
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-sm text-white/60">
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
