import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campunex — Campus Ride-Matching Platform',
  description: 'Geospatial campus ride-sharing and ride-matching platform with live driver tracking and dual OTP security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
