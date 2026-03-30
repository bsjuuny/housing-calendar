import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Home, LayoutGrid, Info, Search, Heart, User } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metropolitan Housing Calendar",
  description: "Experience the premium housing subscription calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-full bg-mesh text-foreground">
        {/* Desktop Sidebar Navigation */}
        <nav className="fixed left-6 top-1/2 -translate-y-1/2 w-16 bg-slate-950/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-4 flex flex-col gap-8 items-center shadow-2xl z-50 hidden lg:flex transform-gpu will-change-transform">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <Home className="w-6 h-6 text-white" />
          </div>
          <LayoutGrid className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
          <Search className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
          <Heart className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
          <Info className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-[env(safe-area-inset-bottom,1.5rem)] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-xs bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] lg:hidden transform-gpu will-change-transform touch-none">
          <Home className="w-5 h-5 text-blue-400" />
          <Search className="w-5 h-5 text-slate-500" />
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center -mt-6 border-4 border-slate-950 shadow-xl shadow-blue-600/30">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <Heart className="w-5 h-5 text-slate-500" />
          <User className="w-5 h-5 text-slate-500" />
        </nav>

        {/* Unified Shell Container */}
        <main className="lg:pl-28 lg:pr-12 pt-[env(safe-area-inset-top,7rem)] md:pt-16 relative min-h-screen px-4 pb-10 md:px-0 overflow-x-clip">
          {/* Shared Decorative Background Orbs */}
          <div className="max-w-6xl mx-auto relative z-10 w-full px-2 md:px-0 mt-10 md:mt-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
