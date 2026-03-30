'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Calendar, MapPin, Building2, Bell, Share2, ArrowLeft } from 'lucide-react';
import { SubscriptionEvent } from '@/lib/types/subscription';
import { motion } from 'framer-motion';

interface EventDetailContentProps {
  event: SubscriptionEvent | null;
}

export default function EventDetailContent({ event }: EventDetailContentProps) {
  const router = useRouter();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTitle(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">공고를 찾을 수 없습니다</h2>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 rounded-2xl text-white font-bold"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 pt-4 pb-4 px-4 md:px-6 flex items-center gap-3">
        <Link
          href="/"
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-95 flex-shrink-0"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1 min-w-0">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 10 }}
            className="text-sm md:text-lg font-bold text-slate-200 truncate tracking-tight"
          >
            {event.title}
          </motion.h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-10 md:pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-600/20 via-slate-900/40 to-purple-600/20 p-8 pt-12 md:p-12 border-b border-white/5 text-center">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border mb-6
              ${event.source === 'LH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-400'}
            `}>
              {event.source} 청약 공고
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
              {event.title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
              <MapPin className="w-5 h-5 text-slate-500" />
              <span>{event.region}</span>
            </div>
          </div>

          <div className="px-6 space-y-8">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-5 bg-blue-600 hover:bg-blue-500 rounded-[2rem] text-white font-black shadow-2xl shadow-blue-600/30 transition-all active:scale-95 uppercase tracking-tighter"
              >
                상세 공고 보러가기
                <ExternalLink className="w-5 h-5" />
              </a>
              <button className="p-5 bg-slate-900 border border-white/5 rounded-[2rem] text-slate-300 hover:text-white transition-all">
                <Bell className="w-6 h-6" />
              </button>
            </div>

            {/* Date Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase mb-2">
                  <Calendar className="w-4 h-4 text-blue-500/60" />
                  접수 시작
                </div>
                <div className="text-white text-xl font-black tabular-nums">{event.startDate}</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase mb-2">
                  <Calendar className="w-4 h-4 text-rose-500/60" />
                  접수 종료
                </div>
                <div className="text-white text-xl font-black tabular-nums">{event.endDate}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-900 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-slate-300 font-bold">공급 유형</span>
                </div>
                <span className="text-white font-black bg-white/5 px-6 py-2 rounded-xl border border-white/5">
                  {event.type}
                </span>
              </div>

              {!!event.unitCount && (
                <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-900 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                      <LayoutGrid className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-slate-300 font-bold">모집 세대수</span>
                  </div>
                  <span className="text-white font-black italic text-lg">{event.unitCount.toLocaleString()}세대</span>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-white/5 text-center">
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                정확한 청약 일정과 상세 자격 요건은 반드시 사업 주체의 정식 모집공고문을 확인하시기 바랍니다. 본 정보의 오류나 누락에 대해서는 책임을 지지 않습니다.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

const LayoutGrid = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
