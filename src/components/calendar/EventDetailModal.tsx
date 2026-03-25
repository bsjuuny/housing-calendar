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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900/80 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl glass-panel"
        >
          {/* Header Image/Pattern Placeholder */}
          <div className="h-32 bg-gradient-to-br from-blue-600/30 to-purple-600/30 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-slate-950/80 rounded-full text-white/70 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-lg
                ${event.source === 'LH' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                  event.source === 'SH' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                  event.source === 'IH' ? 'bg-sky-500/20 border-sky-500/30 text-sky-400' :
                  event.source === 'GH' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                  'bg-rose-500/20 border-rose-500/30 text-rose-400'}
              `}>
                {event.source} 청약
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{event.region}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mb-1">
                  <Calendar className="w-3 h-3" />
                  접수 시작
                </div>
                <div className="text-white font-bold">{event.startDate}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mb-1">
                  <Calendar className="w-3 h-3" />
                  접수 종료
                </div>
                <div className="text-white font-bold">{event.endDate}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">단지 유형</span>
                </div>
                <span className="text-white text-sm font-bold bg-white/5 px-3 py-1 rounded-lg">
                  {event.type}
                </span>
              </div>

              {event.unitCount && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <LayoutGrid className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">공급 세대수</span>
                  </div>
                  <span className="text-white text-sm font-bold">{event.unitCount.toLocaleString()}세대</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                상세공고 보기
                <ExternalLink className="w-4 h-4" />
              </a>
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 font-medium">
              * 정확한 일정은 반드시 해당 기관의 모집공고문을 통해 재확인하시기 바랍니다.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Subcomponent used in regional code
const LayoutGrid = ({ className }: { className: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
