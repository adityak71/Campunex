'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, Send, CheckCircle2, User, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('Verification');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Contact Support
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Have questions about university domain verification or technical queries? Send us a message.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Message Received!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Thank you for contacting Campunex support. Our team will review your query and respond to <strong>{email}</strong> shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setMessage(''); }}
              className="px-5 py-2 bg-[#1e3a8a] dark:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@lpu.in"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="Verification">University Email Verification</option>
                <option value="Matching">PostGIS Proximity Matching</option>
                <option value="OTP">Dual OTP Verification</option>
                <option value="WebSockets">Real-Time Map & Tracking</option>
                <option value="Other">General Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message Details</label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue or feedback in detail..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1e3a8a] dark:bg-cyan-600 hover:bg-[#1d3271] dark:hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              Send Support Message <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
