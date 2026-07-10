'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Bell, 
  Download,
  AlertCircle,
  Clock,
  TrendingUp,
  Building2,
  ArrowRight,
  Star
} from 'lucide-react';
import { SubscriptionEvent } from '@/lib/types/subscription';
import { useAppStore } from '@/store/useAppStore';
import EventDetailModal from './EventDetailModal';
import { cn } from '@/lib/utils';

import { getAllSubscriptions } from '@/lib/api';
import PremiumMobileDashboard from './PremiumMobileDashboard';

const getColorClasses = (source: string, region: string) => {
  if (source === 'LH') return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  if (region.includes('서울')) return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
  if (region.includes('경기')) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  if (region.includes('인천')) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  if (region.includes('부산')) return 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400';
  if (region.includes('대구')) return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
  if (region.includes('광주')) return 'bg-teal-500/10 border-teal-500/30 text-teal-400';
  if (region.includes('대전')) return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
  if (region.includes('울산')) return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
  if (region.includes('강원')) return 'bg-lime-500/10 border-lime-500/30 text-lime-400';
  return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
};

const getAccentColor = (source: string, region: string) => {
  if (source === 'LH') return 'bg-blue-500';
  if (region.includes('서울')) return 'bg-indigo-500';
  if (region.includes('경기')) return 'bg-emerald-500';
  if (region.includes('인천')) return 'bg-amber-500';
  if (region.includes('부산')) return 'bg-fuchsia-500';
  if (region.includes('대구')) return 'bg-orange-500';
  if (region.includes('광주')) return 'bg-teal-500';
  if (region.includes('대전')) return 'bg-cyan-500';
  return 'bg-rose-500';
};

interface CalendarProps {
  events: SubscriptionEvent[];
}

export default function Calendar({ events }: CalendarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SubscriptionEvent | null>(null);
  const [view, setView] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const router = useRouter();

  const { searchQuery, setSearchQuery, favorites, toggleFavorite, showFavoritesOnly, setShowFavoritesOnly } = useAppStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Optimized Resize & View Strategy - Prevents jitter/loops
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial view based on mobile detection
  useEffect(() => {
    if (isMobile && view !== 'DAY' && view !== 'WEEK') {
      setView('DAY');
    } else if (!isMobile && view !== 'MONTH') {
      setView('MONTH');
    }
  }, [isMobile]);

  // Body Scroll Lock when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [selectedEvent]);

  // Filter States
  const [activeSources, setActiveSources] = useState<string[]>(['HOME', 'LH']);
  const [activeRegions, setActiveRegions] = useState<string>('ALL');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const weekStart = startOfWeek(currentDate, { locale: ko });
  const weekEnd = endOfWeek(currentDate, { locale: ko });

  const startDate = view === 'MONTH' ? startOfWeek(monthStart, { weekStartsOn: 0 }) : view === 'WEEK' ? weekStart : currentDate;
  const endDate = view === 'MONTH' ? endOfWeek(monthEnd, { weekStartsOn: 0 }) : view === 'WEEK' ? weekEnd : currentDate;

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrev = () => {
    if (view === 'MONTH') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'WEEK') setCurrentDate(subDays(currentDate, 7));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'MONTH') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'WEEK') setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  // Filtering Logic
  const filteredEvents = events.filter(event => {
    const matchSource = activeSources.includes(event.source);
    const matchRegion = activeRegions === 'ALL' ||
      (activeRegions === 'SEOUL' && event.region.includes('서울')) ||
      (activeRegions === 'GYEONGGI' && event.region.includes('경기')) ||
      (activeRegions === 'INCHEON' && event.region.includes('인천'));
      
    const matchSearch = !searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFavorites = !showFavoritesOnly || favorites.includes(String(event.id));

    return matchSource && matchRegion && matchSearch && matchFavorites;
  });

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return filteredEvents.filter(event =>
      event.startDate <= dateStr && dateStr <= event.endDate
    );
  };

  // Mobile Premium View Integration
  if (isMobile) {
    return <PremiumMobileDashboard events={events} />;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-0">
      {/* Premium Desktop Status Bar - Hidden on Mobile */}
      <div className="hidden lg:grid grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/10 active:scale-[0.98]">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Intelligence</p>
                <h4 className="text-xl font-black text-white tracking-tighter">청약 공고 분석</h4>
             </div>
             <TrendingUp className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="p-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-500 active:scale-[0.98]">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Source: LH</p>
                <h4 className="text-xl font-black text-white tracking-tighter">
                  {events.filter(e => e.source === 'LH').length} <span className="text-xs text-slate-500 font-bold ml-1">ITEMS</span>
                </h4>
             </div>
             <div className="w-8 h-8 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-indigo-400" />
             </div>
          </div>
          <div className="p-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all duration-500 active:scale-[0.98]">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Source: Home</p>
                <h4 className="text-xl font-black text-white tracking-tighter">
                  {events.filter(e => e.source === 'HOME').length} <span className="text-xs text-slate-500 font-bold ml-1">ITEMS</span>
                </h4>
             </div>
             <div className="w-8 h-8 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
             </div>
          </div>
          <div className="p-6 rounded-[2rem] bg-blue-600 border border-blue-400 flex items-center justify-between group cursor-pointer shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-transform">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">Status</p>
                <h4 className="text-xl font-black text-white tracking-tighter">실시간 연동중</h4>
             </div>
             <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
             </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white">
              {format(currentDate, view === 'DAY' ? 'yyyy. MM. dd' : 'yyyy. MM', { locale: ko })}
            </h2>
            {isRefreshing && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Syncing</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-[8px] md:text-sm font-bold uppercase tracking-widest leading-none">
            {view === 'DAY' ? format(currentDate, 'EEEE', { locale: ko }) : 'Subscription Schedule'}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
          <div className="hidden md:flex bg-slate-950/50 border border-white/10 p-1 rounded-2xl shadow-xl">
            {(['DAY', 'WEEK', 'MONTH'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                  view === v ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl flex items-center shadow-xl">
            <button
              onClick={handlePrev}
              className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 md:px-4 py-2 text-[9px] md:text-xs font-black text-slate-300 hover:text-white transition-colors uppercase tracking-widest"
            >
              {view === 'DAY' ? 'Today' : view === 'WEEK' ? 'Week' : 'Month'}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl items-center px-4 shadow-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search className="w-4 h-4 text-slate-400 relative z-10" />
              <input
                type="text"
                placeholder="공고명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-white text-sm py-2.5 px-3 focus:outline-none w-48 placeholder-slate-500 relative z-10"
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "p-2.5 md:p-3 rounded-xl md:rounded-3xl transition-all active:scale-90 shadow-xl border",
                showFavoritesOnly ? "bg-amber-500 border-amber-400 text-amber-50" : "bg-slate-900/50 backdrop-blur-3xl border-white/10 text-slate-400 hover:text-amber-400"
              )}
              title="즐겨찾기 모아보기"
            >
              <Star className={cn("w-4 h-4 md:w-5 md:h-5", showFavoritesOnly && "fill-current")} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2.5 md:p-3 rounded-xl md:rounded-3xl transition-all active:scale-90 shadow-xl border",
                showFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900/50 backdrop-blur-3xl border-white/10 text-slate-400 hover:text-white"
              )}
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="relative z-30 px-2 md:px-0 animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="space-y-2 flex-grow">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">공급 기관</span>
                <div className="flex flex-wrap gap-2">
                  {['HOME', 'LH'].map((src) => {
                    const isActive = activeSources.includes(src);
                    const getThemeColor = (s: string) => {
                      switch (s) {
                        case 'LH': return 'from-blue-600 to-blue-700 border-blue-400 shadow-blue-900/40';
                        default: return 'from-rose-600 to-rose-700 border-rose-400 shadow-rose-900/40';
                      }
                    };
                    return (
                      <button
                        key={src}
                        onClick={() => {
                          setActiveSources(prev =>
                            prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
                          );
                        }}
                        className={cn(
                          "px-5 py-3 rounded-2xl text-sm font-black transition-all border transform-gpu active:scale-95",
                          isActive
                            ? cn("bg-gradient-to-r text-white shadow-xl ring-1 ring-white/20", getThemeColor(src))
                            : "bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                        )}
                      >
                        {src}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 lg:min-w-[300px]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">지역 범위</span>
                <div className="flex gap-2">
                  {['ALL', 'SEOUL', 'GYEONGGI', 'INCHEON'].map((reg) => {
                    const isActive = activeRegions === reg;
                    const getRegionColor = (r: string) => {
                      switch (r) {
                        case 'SEOUL': return 'from-indigo-600 to-indigo-700 border-indigo-400 shadow-indigo-900/40';
                        case 'GYEONGGI': return 'from-emerald-600 to-emerald-700 border-emerald-400 shadow-emerald-900/40';
                        case 'INCHEON': return 'from-amber-500 to-amber-600 border-amber-400 shadow-amber-900/40';
                        default: return 'from-slate-600 to-slate-700 border-slate-400 shadow-slate-900/40';
                      }
                    };
                    return (
                      <button
                        key={reg}
                        onClick={() => setActiveRegions(reg)}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-2xl text-sm font-black transition-all border transform-gpu active:scale-95",
                          isActive
                            ? cn("bg-gradient-to-r text-white shadow-xl ring-1 ring-white/20", getRegionColor(reg))
                            : "bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                        )}
                      >
                        {reg === 'ALL' ? '전체' : reg === 'SEOUL' ? '서울' : reg === 'GYEONGGI' ? '경기' : '인천'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view !== 'DAY' && (
        <div className="grid grid-cols-7 gap-px mb-4 min-w-[600px] md:min-w-0">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={cn(
              "text-center py-2 text-[10px] font-black uppercase tracking-widest",
              i === 0 ? "text-rose-500/80" : i === 6 ? "text-blue-500/80" : "text-slate-500"
            )}>
              {day}
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        {filteredEvents.length === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] rounded-[40px] border border-white/5 pointer-events-none min-h-[400px]">
            <div className="p-6 rounded-full bg-slate-900/50 border border-white/5 mb-4">
              <Filter className="w-12 h-12 text-slate-700" />
            </div>
            <p className="text-xl font-bold text-slate-400">데이터가 없습니다</p>
          </div>
        )}

        <div className={cn(
          "grid gap-px mb-12 transition-all duration-500 border-t border-l border-white/5",
          view === 'DAY' ? "grid-cols-1" : "grid-cols-7 min-w-[600px] md:min-w-0 overflow-visible"
        )}>
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTod = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative p-4 md:p-6 transition-all duration-500 group/cell overflow-hidden border-r border-b border-white/5",
                  view === 'DAY' ? "min-h-[400px] md:min-h-[600px] bg-slate-900/40 rounded-[4rem] border-none shadow-[0_32px_80px_rgba(0,0,0,0.5)]" :
                    view === 'WEEK' ? "min-h-[250px] bg-slate-900/20 hover:bg-slate-900/40" :
                      isCurrentMonth ? "bg-slate-900/20 hover:bg-slate-900/40 md:min-h-[180px]" : "bg-slate-950/40 opacity-30 pointer-events-none md:min-h-[180px]",
                  isTod && view === 'MONTH' ? "ring-2 ring-blue-500/50 ring-inset bg-blue-500/5 shadow-2xl z-10" : ""
                )}
                onClick={() => {
                  if (view !== 'DAY' && dayEvents.length > 0) {
                    setSelectedEvent(dayEvents[0]);
                  }
                }}
              >
                <div className={cn(
                  "flex items-center",
                  view === 'DAY' ? "border-b border-white/5 pb-4 mb-2 md:mb-4 gap-4" : "gap-2 md:gap-4 justify-between mb-2"
                )}>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className={cn(
                      "font-black flex items-center justify-center rounded-xl md:rounded-[2rem] border border-white/10 shadow-xl",
                      view === 'DAY' ? "w-12 h-12 md:w-16 md:h-16 text-xl md:text-3xl bg-slate-800/80 text-white" :
                        isToday(day) ? "w-6 h-6 md:w-10 md:h-10 text-xs md:text-base bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border-none" :
                          "w-6 h-6 md:w-10 md:h-10 text-xs md:text-base bg-slate-800/80 text-white"
                    )}>
                      {format(day, 'd')}
                    </span>

                    {view === 'DAY' && (
                      <div className="flex flex-col justify-center">
                        <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest leading-none mb-1">
                          {format(day, 'yyyy. MM')}
                        </span>
                        <span className="text-white text-lg md:text-xl font-black tracking-tighter leading-none">
                          {format(day, 'EEEE', { locale: ko })}
                        </span>
                      </div>
                    )}
                  </div>

                  {view === 'DAY' && isToday(day) && (
                    <span className="ml-auto px-3 md:px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[9px] md:text-[10px] font-black rounded-full border border-indigo-500/20 shadow-lg">
                      TODAY
                    </span>
                  )}
                </div>

                  <div className={cn(
                    "flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar",
                    view === 'DAY' ? "max-w-2xl mx-auto w-full pt-2" : ""
                  )}>
                    {dayEvents.length === 0 && view === 'DAY' && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 py-12">
                        <LayoutGrid className="w-10 h-10 md:w-12 md:h-12 opacity-20" />
                        <p className="font-bold text-sm md:text-base">이날은 청약 일정이 없습니다</p>
                      </div>
                    )}

                    {(() => {
                      // Monthly View: Limit to 4 items and show '+ more'
                      const displayLimit = view === 'MONTH' && !isMobile ? 4 : 999;
                      const itemsToShow = dayEvents.slice(0, displayLimit);
                      const moreCount = dayEvents.length - displayLimit;

                      return (
                        <React.Fragment>
                          {itemsToShow.map((event) => {
                            const colorClasses = getColorClasses(event.source, event.region);
                            const accentColor = getAccentColor(event.source, event.region);

                            return (
                              <Link
                                key={event.id}
                                href={`/event/${String(event.id).replace(/[\/\s]/g, '-')}`}
                                className={cn(
                                  "transition-all cursor-pointer border group/btn flex flex-col transform-gpu relative overflow-hidden",
                                  view === 'DAY'
                                    ? "p-8 md:p-12 rounded-[3.5rem] bg-slate-900/80 border-white/10 hover:bg-slate-800/90 hover:border-white/20 hover:shadow-2xl hover:-translate-y-3 active:scale-[0.98] shadow-2xl"
                                    : cn("px-2 py-1.5 rounded-xl text-[9px] md:text-[11px] font-black leading-tight border transition-all hover:z-10 hover:shadow-lg", colorClasses)
                                )}
                              >
                                {view === 'DAY' && (
                                  <div className={cn("absolute left-0 top-0 bottom-0 w-3 md:w-5", accentColor)} />
                                )}

                                <div className={cn("flex items-start justify-between", view === 'DAY' ? "gap-2 md:gap-8" : "gap-0.5")}>
                                  <h3 className={cn(
                                    "font-black tracking-[-0.05em] leading-[1.1] transition-all break-words",
                                    view === 'DAY' ? "text-2xl md:text-5xl lg:text-6xl text-slate-50 group-hover/btn:text-white pr-4" : "text-[8px] md:text-[10px] text-white line-clamp-1"
                                  )}>
                                    {event.title}
                                  </h3>
                                  <div 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleFavorite(String(event.id));
                                    }}
                                    className="p-1 -m-1 z-10 shrink-0 cursor-pointer"
                                  >
                                    {isClient && favorites.includes(String(event.id)) ? (
                                      <Star className={cn("text-amber-400 fill-amber-400", view === 'DAY' ? "w-4 h-4 md:w-6 md:h-6" : "w-2.5 h-2.5")} />
                                    ) : (
                                      <Star className={cn("text-slate-500/50 hover:text-amber-400/50 transition-colors", view === 'DAY' ? "w-4 h-4 md:w-6 md:h-6" : "w-2.5 h-2.5")} />
                                    )}
                                  </div>
                                </div>

                                {view === 'DAY' && (
                                  <div className="mt-8 flex flex-wrap gap-4">
                                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                                      <Bell className="w-5 h-5 text-slate-500" />
                                      <span className="text-slate-400 text-xs font-bold tracking-tight">접수 기간</span>
                                      <span className="text-slate-100 text-xs font-black">{event.startDate} 시작</span>
                                    </div>
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                          
                          {moreCount > 0 && view === 'MONTH' && (
                            <div className="px-2 py-1 flex items-center gap-1">
                              <div className="w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                {moreCount} More
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })()}
                  </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal - Disabled in favor of separate page */}
    </div>
  );
}
