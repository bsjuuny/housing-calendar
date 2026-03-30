import { getAllSubscriptions } from '@/lib/api';
import Calendar from '@/components/calendar/Calendar';
import { Home, LayoutGrid, Info, Search, Heart, User } from 'lucide-react';

export default async function IndexPage() {
  const subscriptions = await getAllSubscriptions();
  
  if (subscriptions.length > 0) {
    const dates = subscriptions.map(s => s.startDate).filter(Boolean).sort();
    const marchItems = subscriptions.filter(s => s.startDate && s.startDate.includes('2026-03'));
    const aprilItems = subscriptions.filter(s => s.startDate && s.startDate.includes('2026-04'));
    console.warn(`[DATA AUDIT] Total: ${subscriptions.length} items`);
    console.warn(`[DATA AUDIT] Full Date Range: ${dates[0]} ~ ${dates[dates.length - 1]}`);
    console.warn(`[MARCH AUDIT] Found ${marchItems.length} items starting in March 2026`);
    console.warn(`[APRIL AUDIT] Found ${aprilItems.length} items starting in April 2026`);
    if (subscriptions.length > 0) {
      console.warn(`[SAMPLE] First 5 dates: ${subscriptions.slice(0, 5).map(s => s.startDate).join(', ')}`);
    }
  }

  return (
    <>
      {/* Header Hero Section */}
      <section className="mb-6 md:mb-12 max-w-7xl mx-auto px-4 md:px-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="flex-1 space-y-2 md:space-y-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
              Live Hub
            </span>
            <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter leading-none shrink-0">
              METROPOLITAN <br className="hidden md:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                  CALENDAR
              </span>
            </h1>
          </div>
          
          <div className="grid grid-cols-2 md:flex bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-[2rem] p-1 backdrop-blur-3xl shadow-2xl lg:min-w-[300px] w-full md:w-auto">
            <div className="flex-1 px-4 md:px-6 py-2.5 md:py-4 border-r border-white/5 flex flex-col items-center justify-center">
              <span className="text-xl md:text-2xl font-black text-white tracking-tight">42</span>
              <span className="text-[8px] md:text-[9px] uppercase font-black text-slate-500 tracking-wider">ANNCS</span>
            </div>
            <div className="flex-1 px-4 md:px-6 py-3 md:py-4 flex flex-col items-center justify-center">
              <span className="text-xl md:text-2xl font-black text-blue-400 tracking-tight">Real</span>
              <span className="text-[8px] md:text-[9px] uppercase font-black text-slate-500 tracking-wider">STATUS</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Calendar Main View */}
      <section className="relative z-10 glass-panel rounded-3xl md:rounded-[3rem] shadow-[0_32px_120px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 mx-2 md:mx-0">
        <div className="overflow-x-auto custom-scrollbar">
          <Calendar events={subscriptions} />
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="mt-20 text-center pb-10">
        <p className="text-slate-500 text-sm font-medium">© 2026 Metropolitan Housing Data Services. All rights reserved.</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <span className="text-xs font-bold text-slate-700 hover:text-slate-400 cursor-pointer transition-colors">데이터 출처: 공공데이터포털, LH, 청약홈</span>
        </div>
      </footer>
    </>
  );
}
