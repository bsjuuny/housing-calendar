'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, MapPin, Building2, Bell, Share2 } from 'lucide-react';
import { SubscriptionEvent } from '@/lib/types/subscription';

interface EventDetailModalProps {
  event: SubscriptionEvent | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content - Responsive Bottom Sheet / Modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-slate-950 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[3rem] shadow-[0_-20px_80px_rgba(0,0,0,0.5)] md:shadow-[0_32px_120px_rgba(0,0,0,0.8)] glass-panel max-h-[95dvh] md:max-h-[90dvh] flex flex-col overflow-hidden"
        >
          {/* Persistent Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 md:top-8 right-6 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-full text-white shadow-xl z-[110] border border-white/10 transition-all active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mobile Handle */}
          <div className="flex justify-center py-3 md:hidden shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-blue-600/30 via-slate-900/40 to-purple-600/30 relative shrink-0 p-6 md:p-10 pt-8 md:pt-16 border-b border-white/5">
              
              <div className="space-y-4 pr-12">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                  ${event.source === 'LH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400'}
                `}>
                  <div className={`w-1 h-1 rounded-full mr-2 animate-pulse
                    ${event.source === 'LH' ? 'bg-emerald-400' : 'bg-rose-400'}
                  `} />
                  {event.source} 청약
                </span>
                
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-bold">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{event.region}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 text-slate-500 text-[9px] md:text-[10px] font-black uppercase mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500/60" />
                    접수 시작
                  </div>
                  <div className="text-white text-sm md:text-base font-bold tabular-nums">{event.startDate}</div>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 text-slate-500 text-[9px] md:text-[10px] font-black uppercase mb-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500/60" />
                    접수 종료
                  </div>
                  <div className="text-white text-sm md:text-base font-bold tabular-nums">{event.endDate}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-slate-300 text-xs md:text-sm font-bold">단지 유형</span>
                  </div>
                  <span className="text-white text-xs md:text-sm font-black bg-white/5 px-4 py-1.5 rounded-xl border border-white/5">
                    {event.type}
                  </span>
                </div>

                {!!event.unitCount && parseInt(event.unitCount.toLocaleString()) > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10">
                        <LayoutGrid className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-slate-300 text-xs md:text-sm font-bold">공급 세대수</span>
                    </div>
                    <span className="text-white text-xs md:text-sm font-black italic">{event.unitCount.toLocaleString()}세대</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 md:gap-3 pt-4">
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl md:rounded-[2rem] text-white text-sm md:text-base font-black shadow-xl shadow-blue-600/20 transition-all active:scale-95 uppercase tracking-tighter"
                >
                  Notice Detail
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button className="p-4 bg-slate-900 border border-white/5 hover:bg-slate-800 rounded-2xl md:rounded-[2rem] text-slate-300 hover:text-white transition-all active:scale-95">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-4 bg-slate-900 border border-white/5 hover:bg-slate-800 rounded-2xl md:rounded-[2rem] text-slate-300 hover:text-white transition-all active:scale-95">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950/40 rounded-3xl p-6 border border-white/5">
                <p className="text-[10px] text-center text-slate-600 font-bold leading-relaxed">
                  * 본 서비스에서 제공하는 정보는 참고용이며, 정확한 일정과 상세 조건은 반드시 해당 홈페이지나 공공포털의 정식 공고문을 확인하시기 바랍니다. 오류에 대해 책임을 지지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Subcomponent
const LayoutGrid = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
