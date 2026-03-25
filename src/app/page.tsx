import { getAllSubscriptions } from '@/lib/api';
import Calendar from '@/components/calendar/Calendar';
import { Home, LayoutGrid, Info, Search, Heart, User } from 'lucide-react';

export default async function IndexPage() {
  const subscriptions = await getAllSubscriptions();

  return (
    <div className="bg-mesh min-h-screen">
      {/* Desktop Sidebar Navigation */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 w-16 bg-slate-950/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-4 flex flex-col gap-8 items-center shadow-2xl z-50 hidden lg:flex">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
          <Home className="w-6 h-6 text-white" />
        </div>
        <LayoutGrid className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
        <Search className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
        <Heart className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
        <Info className="w-6 h-6 text-slate-500 hover:text-white transition-colors cursor-pointer" />
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-full px-8 py-4 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] lg:hidden">
        <Home className="w-6 h-6 text-blue-400" />
        <Search className="w-6 h-6 text-slate-500" />
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center -mt-8 border-4 border-slate-950 shadow-xl shadow-blue-600/30">
          <LayoutGrid className="w-6 h-6 text-white" />
        </div>
        <Heart className="w-6 h-6 text-slate-500" />
        <User className="w-6 h-6 text-slate-500" />
      </nav>

      {/* Main Content Area */}
      <main className="lg:pl-28 lg:pr-12 pt-8 md:pt-12 pb-32 relative overflow-hidden px-4 md:px-0">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header Hero Section */}
        <section className="mb-8 md:mb-12 max-w-7xl mx-auto px-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                Live Hub
              </span>
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
                METROPOLITAN <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                  CALENDAR
                </span>
              </h1>
            </div>
            
            <div className="grid grid-cols-2 bg-slate-900/40 border border-white/5 rounded-[2rem] p-1 backdrop-blur-3xl shadow-2xl lg:min-w-[300px]">
              <div className="px-6 py-4 border-r border-white/5 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white tracking-tight">42</span>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">ANNCS</span>
              </div>
              <div className="px-6 py-4 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-blue-400 tracking-tight">Real</span>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">STATUS</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Calendar Main View */}
        <section className="relative z-10 glass-panel rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_120px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 mx-2 md:mx-0">
          <Calendar events={subscriptions} />
        </section>

        {/* Footer Credit */}
        <footer className="mt-20 text-center">
          <p className="text-slate-500 text-sm font-medium">© 2026 Metropolitan Housing Data Services. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <span className="text-xs font-bold text-slate-700 hover:text-slate-400 cursor-pointer transition-colors">데이터 출처: 공공데이터포털, LH, SH, GH, iH, 청약홈</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
