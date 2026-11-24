import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SV Stock Research - Admin CRM & Lead Management',
  description: 'Enterprise Lead Management & Synchronization Engine for SV Stock Research',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
