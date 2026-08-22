'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Password reset link sent to your campus email!', 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered campus email address and we'll send you a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Password reset instructions have been sent to <strong>{email}</strong>.
              </p>
              <Link href="/login">
                <Button variant="primary" size="sm" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Campus Email Address"
                type="email"
                required
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@lpu.in"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            Remembered your password?{' '}
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
