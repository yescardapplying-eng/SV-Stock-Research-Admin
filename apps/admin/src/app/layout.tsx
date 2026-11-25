import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export const metadata: Metadata = {
  title: 'SV Stock Research - Admin CRM & Lead Management',
  description: 'Enterprise Lead Management & Synchronization Engine for SV Stock Research',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  );
}
