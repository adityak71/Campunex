import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '../components/ui/Toast';
import AuthGuard from '../components/AuthGuard';

export const metadata: Metadata = {
  title: 'Campunex — Campus Ride-Matching Platform',
  description: 'Your campus. Your route. Your ride. Geospatial campus ride-sharing and ride-matching platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans transition-colors duration-200">
        <ToastProvider>
          <AuthGuard>{children}</AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
