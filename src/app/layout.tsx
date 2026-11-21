import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

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
      <body className="bg-[#09090b] text-zinc-100 min-h-screen antialiased flex flex-row selection:bg-zinc-800 selection:text-white">
        {/* Main Fixed Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pb-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
