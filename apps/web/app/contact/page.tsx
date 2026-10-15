'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Mail, Send, CheckCircle2, User, ShieldAlert, FileText } from 'lucide-react';
import { apiRequest } from '../../lib/api';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialIssue = searchParams.get('issue');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Verification');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialIssue === 'blocked') {
      setIssueType('Account Blocked / Appeal');
      setMessage('My account has been suspended by administration. Please review my verification details and reactivate my access.');
    } else if (initialIssue === 'verification') {
      setIssueType('Driver ID & Document Verification');
      setMessage('I have submitted my driver KYC documents (Aadhaar / Vehicle details). Please expedite my verification.');
    }
  }, [initialIssue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest('/support/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, issueType, message }),
      });

      setSubmitted(true);
      showToast(response?.message || 'Support message submitted successfully!', 'success');
    } catch (error) {
      showToast('Error submitting support request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8 w-full">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
          Contact Customer Care
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Need help with university email verification, account appeals, or driver ID approvals? Send us a ticket.
        </p>
      </div>

      {initialIssue === 'blocked' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>
            <strong>Account Appeal Mode:</strong> Please ensure your registered campus email is provided so platform administrators can locate and review your profile.
          </span>
        </div>
      )}

      {submitted ? (
        <Card className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ticket Submitted!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Thank you for contacting Campunex Customer Care. Our administration team has received your ticket and will review it shortly. A response will be sent to <strong>{email}</strong>.
          </p>
          <Button
            onClick={() => { setSubmitted(false); setMessage(''); }}
            variant="primary"
            size="sm"
          >
            Submit Another Query
          </Button>
        </Card>
      ) : (
        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Full Name"
              required
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aditya Kumar"
            />

            <Input
              label="Campus / Registered Email Address"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
            />

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
              >
                <option value="Account Blocked / Appeal">Account Blocked / Reactivation Appeal</option>
                <option value="Driver ID & Document Verification">Driver ID & Document Verification (24-48h status)</option>
                <option value="University Email Verification">University Email Verification</option>
                <option value="Route Proximity Matching">Route Proximity Matching</option>
                <option value="Dual OTP Verification">Dual OTP Verification</option>
                <option value="Real-Time Map & Tracking">Real-Time Map & Tracking</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message & Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your situation in detail so our team can assist you..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full font-bold"
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Ticket to Customer Care
            </Button>
          </form>
        </Card>
      )}
    </main>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Customer Care...</div>}>
        <ContactFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}
