'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Filter, Bell, LayoutGrid, MapPin } from 'lucide-react';
import { SubscriptionEvent } from '@/lib/types/subscription';
import EventDetailModal from './EventDetailModal';
import { cn } from '@/lib/utils';

import { getAllSubscriptions } from '@/lib/api';

interface CalendarProps {
  events: SubscriptionEvent[];
}

export default function Calendar({ events }: CalendarProps) {
  const [currentEvents, setCurrentEvents] = useState<SubscriptionEvent[]>(events);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SubscriptionEvent | null>(null);
  const [view, setView] = useState<'DAY' | 'WEEK' | 'MONTH'>('MONTH');
  const [showFilters, setShowFilters] = useState(false);

  // 실시간 최신화 로직
  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);
      try {
        console.log('[Calendar] Triggering client-side refresh...');
        const latestEvents = await getAllSubscriptions();
        if (latestEvents.length > 0) {
          setCurrentEvents(latestEvents);
          console.log(`[Calendar] Refreshed with ${latestEvents.length} items`);
        }
      } catch (error) {
        console.error('[Calendar] Failed to refresh live data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshData();
  }, []);

  // Set initial view for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setView('DAY');
    }
  }, []);
  
  // Filter States
  const [activeSources, setActiveSources] = useState<string[]>(['HOME', 'LH', 'GH', 'IH', 'SH']);
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
  const filteredEvents = currentEvents.filter(event => {
    const matchSource = activeSources.includes(event.source);
    const matchRegion = activeRegions === 'ALL' || 
                        (activeRegions === 'SEOUL' && event.region.includes('서울')) ||
                        (activeRegions === 'GYEONGGI' && event.region.includes('경기')) ||
                        (activeRegions === 'GYEONGGI' && event.region.includes('시')) || // Simple heuristic
                        (activeRegions === 'INCHEON' && event.region.includes('인천'));
    return matchSource && matchRegion;
  });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(new Date(event.startDate), day));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
              {format(currentDate, 'yyyy. MM', { locale: ko })}
            </h2>
            {isRefreshing && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Syncing</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-widest leading-none">
            Subscription Schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Selector */}
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
              className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-[10px] md:text-xs font-black text-slate-300 hover:text-white transition-colors uppercase tracking-widest"
            >
              {view === 'DAY' ? 'Today' : view === 'WEEK' ? 'Week' : 'Month'}
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-3 rounded-2xl md:rounded-3xl transition-all active:scale-90 shadow-xl border",
                showFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900/50 backdrop-blur-3xl border-white/10 text-slate-400 hover:text-white"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-3 bg-slate-900/50 backdrop-blur-3xl border border-white/10 text-slate-400 hover:text-white rounded-2xl md:rounded-3xl transition-all relative active:scale-90 shadow-xl">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Options Bar */}
      {showFilters && (
        <div className="px-2 md:px-0 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="space-y-2 flex-grow">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">공급 기관</span>
                <div className="flex flex-wrap gap-2">
                  {['HOME', 'LH', 'GH', 'IH', 'SH'].map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        setActiveSources(prev => 
                          prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
                        );
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        activeSources.includes(src) 
                          ? "bg-white/10 border-white/20 text-white shadow-lg" 
                          : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 lg:min-w-[300px]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">지역 범위</span>
                <div className="flex gap-2">
                  {['ALL', 'SEOUL', 'GYEONGGI', 'INCHEON'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setActiveRegions(reg)}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        activeRegions === reg 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {reg === 'ALL' ? '전체' : reg === 'SEOUL' ? '서울' : reg === 'GYEONGGI' ? '경기' : '인천'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Header (Hidden for DAY view) */}
      {view !== 'DAY' && (
        <div className="grid grid-cols-7 gap-px mb-4">
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

      {/* Calendar Content Area */}
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
          "grid gap-2 mb-12",
          view === 'DAY' ? "grid-cols-1" : "grid-cols-7"
        )}>
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border transition-all flex flex-col gap-6 relative group overflow-hidden",
                  view === 'DAY' ? "min-h-[500px] bg-slate-900/60 border-white/10 shadow-3xl" : 
                  view === 'WEEK' ? "min-h-[250px] bg-slate-900/40 border-white/5" :
                  isCurrentMonth ? "bg-slate-900/40 border-white/5 active:bg-slate-800/40 min-h-[100px] md:min-h-[160px]" : "bg-transparent border-transparent opacity-10 pointer-events-none"
                )}
                onClick={() => {
                  if (view !== 'DAY' && dayEvents.length > 0) {
                    setSelectedEvent(dayEvents[0]);
                  }
                }}
              >
                <div className={cn(
                  "flex items-center",
                  view === 'DAY' ? "border-b border-white/5 pb-4 mb-4 gap-4" : "gap-4 justify-between mb-2"
                )}>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "font-black flex items-center justify-center rounded-2xl md:rounded-[2rem] border border-white/10 shadow-xl",
                      view === 'DAY' ? "w-16 h-16 text-3xl bg-slate-800/80 text-white" : 
                      isToday(day) ? "w-6 h-6 md:w-10 md:h-10 text-[10px] md:text-sm bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border-none" : 
                      "w-6 h-6 md:w-10 md:h-10 text-[10px] md:text-sm bg-slate-800/80 text-white"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {view === 'DAY' && (
                      <div className="flex flex-col justify-center">
                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-1">
                          {format(day, 'yyyy. MM')}
                        </span>
                        <span className="text-white text-xl font-black tracking-tighter leading-none">
                          {format(day, 'EEEE', { locale: ko })}
                        </span>
                      </div>
                    )}
                  </div>

                  {view === 'DAY' && isToday(day) && (
                    <span className="ml-auto px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 shadow-lg">
                      TODAY
                    </span>
                  )}
                </div>

                <div className={cn(
                  "flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar",
                  view === 'DAY' ? "max-w-2xl mx-auto w-full pt-4" : ""
                )}>
                  {dayEvents.length === 0 && view === 'DAY' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                      <LayoutGrid className="w-12 h-12 opacity-20" />
                      <p className="font-bold">이날은 청약 일정이 없습니다</p>
                    </div>
                  )}

                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={cn(
                        "transition-all cursor-pointer border group/btn",
                        view === 'DAY' 
                          ? "p-5 rounded-3xl bg-white/5 border-white/5 flex flex-col gap-3 hover:bg-white/10 hover:border-white/10 hover:scale-[1.02]" 
                          : "px-1.5 py-1 rounded-lg text-[8px] md:text-[10px] font-black leading-tight truncate hover:scale-[1.05] hover:z-10",
                        event.source === 'LH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        event.source === 'SH' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        event.source === 'IH' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                        event.source === 'GH' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      )}
                    >
                      {view === 'DAY' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="opacity-60 text-[10px] font-black uppercase tracking-widest">[{event.source}]</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold">{event.type}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white group-hover/btn:text-blue-400 transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                             <MapPin className="w-4 h-4" />
                             <span>{event.region}</span>
                          </div>
                        </>
                      ) : (
                        event.title
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Integration */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
