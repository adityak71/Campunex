import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-white">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-sm font-semibold tracking-wide">
          CAMPUNEX PLATFORM
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Campus Ride-Matching Platform
        </h1>
        <p className="text-lg text-slate-300">
          Engineered with PostGIS 500m route proximity matching, WebSockets live GPS tracking, and dual 4-digit OTP ride verification.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-medium transition"
          >
            Get Started
          </a>
          <a
            href="http://localhost:4000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition"
          >
            API Health Check
          </a>
        </div>
      </div>
    </main>
  );
}
