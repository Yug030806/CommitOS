import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'CommitOS – AI Decision & Execution Intelligence',
  description: 'Your Meetings. Now, Executed. Intelligent meeting memory, cross-meeting decision conflict detection, and predictive execution risk analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen antialiased selection:bg-zinc-800 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
