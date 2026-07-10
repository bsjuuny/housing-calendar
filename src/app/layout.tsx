import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        {/* Unified Shell Container - Optimized for edge-to-edge mobile experience */}
        <main className="pt-[env(safe-area-inset-top,7rem)] md:pt-16 relative min-h-screen pb-10 overflow-x-clip">
          {/* Shared Decorative Background Orbs */}
          <div className="max-w-6xl mx-auto relative z-10 w-full mt-10 md:mt-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
