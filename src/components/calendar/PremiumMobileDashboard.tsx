'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, addDays, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Building2, 
  MapPin, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  TrendingUp, 
  Bell,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';
import { SubscriptionEvent } from '@/lib/types/subscription';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

interface PremiumMobileDashboardProps {
  events: SubscriptionEvent[];
}

export default function PremiumMobileDashboard({ events }: PremiumMobileDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSource, setActiveSource] = useState<string>('ALL');

  const { searchQuery, setSearchQuery, favorites, toggleFavorite, showFavoritesOnly, setShowFavoritesOnly } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const selectedButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current && selectedButtonRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedButtonRef.current;
      const scrollPosition = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
      
      // 약간의 지연을 주어 렌더링 후 스크롤이 안정적으로 먹히도록 보장
      setTimeout(() => {
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }, 100);
    }
  }, [selectedDate, isClient]);

  // Generate Date Ribbon (Past 2 days to Next 14 days)
  const dateRibbon = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => addDays(new Date(), i - 4));
  }, []);

  // Filter Logic based on selected date
  const dayEvents = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return events.filter(event => {
      // Robust date matching: if endDate is missing, check only startDate
      const hasValidDate = event.startDate <= dateStr && (!event.endDate || dateStr <= event.endDate);
      const matchSource = activeSource === 'ALL' || event.source === activeSource;
      const matchSearch = !searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFavorites = !showFavoritesOnly || favorites.includes(String(event.id));
      return hasValidDate && matchSource && matchSearch && matchFavorites;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedDate, activeSource, searchQuery, showFavoritesOnly, favorites]);

  // Insights Logic - Dynamic based on selected date
  const insights = useMemo(() => {
    const selectedStr = format(selectedDate, 'yyyy-MM-dd');
    const newOnSelected = events.filter(e => e.startDate === selectedStr).length;
    
    // Closing Soon is always relative to REALLY today
    const closingSoon = events.filter(e => {
        const end = new Date(e.endDate);
        const diff = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 3;
    }).length;
    
    return { newOnSelected, closingSoon };
  }, [events, selectedDate]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-100 pb-24 lg:hidden">
      {/* 1. High-End Sticky Header */}
      <header className="sticky top-0 z-50 px-5 pt-8 pb-4 bg-slate-950/40 backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              METRO <span className="text-blue-500">LIVE</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Intelligence Hub</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "p-3 rounded-2xl border text-slate-400 transition-colors",
                showSearch ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10"
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "p-3 rounded-2xl border transition-colors relative",
                showFavoritesOnly ? "bg-amber-500 border-amber-400 text-amber-50" : "bg-white/5 border-white/10 text-slate-400"
              )}
            >
              <Star className={cn("w-5 h-5", showFavoritesOnly && "fill-current")} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="공고명 검색..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Date Wheel / Ribbon */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto flex gap-3 pb-2 custom-scrollbar snap-x no-scrollbar"
        >
          {dateRibbon.map((date) => {
            const isSel = isSameDay(date, selectedDate);
            const isTod = isToday(date);
            return (
              <button
                key={date.toISOString()}
                ref={isSel ? selectedButtonRef : null}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "min-w-[64px] shrink-0 flex flex-col items-center py-4 rounded-[2rem] transition-all snap-center border transform-gpu active:scale-95",
                  isSel 
                    ? "bg-blue-600 border-blue-400 text-white shadow-2xl shadow-blue-600/40" 
                    : "bg-slate-900 border-white/5 text-slate-500"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1">
                  {format(date, 'eee', { locale: ko })}
                </span>
                <span className="text-lg font-black leading-none">{format(date, 'd')}</span>
                {isTod && !isSel && <div className="mt-1 w-1 h-1 bg-blue-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* 3. Bento Insights Section */}
        <section className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 border border-white/20 shadow-2xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-8 transform group-active:scale-110 transition-transform">
               <TrendingUp className="w-16 h-16 text-white/10" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-1 block">
                {isToday(selectedDate) ? 'Live Today' : `${format(selectedDate, 'MM.dd')} Scheduled`}
              </span>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">
                {isToday(selectedDate) ? '오늘의' : `${format(selectedDate, 'd')}일의`} <br />청약 인텔리전스
              </h2>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-black">신규 {insights.newOnSelected}건</span>
                </div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px] font-black">마감임박 {insights.closingSoon}건</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="p-5 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col justify-between min-h-[140px]">
             <Building2 className="w-8 h-8 text-blue-500" />
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source: LH</p>
                <h3 className="text-xl font-black text-white tracking-tighter leading-none">
                  {events.filter(e => e.source === 'LH').length} <span className="text-xs text-slate-400">Total</span>
                </h3>
             </div>
          </div>

          <div className="p-5 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col justify-between min-h-[140px]">
             <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source: Home</p>
                <h3 className="text-xl font-black text-white tracking-tighter leading-none">
                  {events.filter(e => e.source === 'HOME').length} <span className="text-xs text-slate-400">Total</span>
                </h3>
             </div>
          </div>
        </section>

        {/* 4. Filter Chips */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'HOME', 'LH'].map((src) => (
            <button
              key={src}
              onClick={() => setActiveSource(src)}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-black transition-all border shrink-0",
                activeSource === src 
                  ? "bg-white text-slate-950 border-white shadow-xl" 
                  : "bg-slate-900 text-slate-500 border-white/5"
              )}
            >
              {src === 'ALL' ? '전체 공고' : src}
            </button>
          ))}
        </section>

        {/* 5. Main Feed - High End Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 italic">
            <h4 className="text-sm font-black text-slate-400 tracking-tighter uppercase underline decoration-blue-500 underline-offset-4">
               {format(selectedDate, 'PPP', { locale: ko })} 일정
            </h4>
            <span className="text-[10px] font-bold text-slate-600">{dayEvents.length} Items</span>
          </div>

          <AnimatePresence mode="popLayout">
            {dayEvents.length === 0 ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="py-20 flex flex-col items-center justify-center space-y-4 grayscale opacity-30"
               >
                  <Building2 className="w-16 h-16 " />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">No Anncs Found</p>
               </motion.div>
            ) : (
              dayEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={`/event/${String(event.id).replace(/[\/\s]/g, '-')}`}
                    className="block p-5 md:p-8 rounded-[2.5rem] bg-slate-900/60 border border-white/5 active:bg-slate-800 transition-all hover:bg-slate-900 group shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            event.source === 'LH' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        )}>
                            {event.source}
                        </div>
                        <div className="flex items-center gap-3">
                            <div 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(String(event.id));
                              }}
                              className="p-2 -mr-2 text-slate-500 active:scale-90 transition-transform cursor-pointer"
                            >
                              {isClient && favorites.includes(String(event.id)) ? (
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                              ) : (
                                <Star className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 opacity-40 group-active:opacity-100 group-active:text-blue-500 transition-all">
                                 <span className="text-[10px] font-black tracking-widest uppercase">Inspect</span>
                                 <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-100 tracking-tighter leading-[1.2] mb-6 group-active:text-blue-400 transition-colors">
                        {event.title}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-400">{event.region || '전국'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-400">{event.startDate} ~ {event.endDate}</span>
                        </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* 6. Premium Bottom Navigation - HANDLED BY layout.tsx, REMOVED FROM HERE */}
    </div>
  );
}
