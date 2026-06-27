import React from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  FileText, 
  BarChart2, 
  List, 
  Settings, 
  Bell, 
  ShieldAlert,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: number;
  setActiveTab: (index: number) => void;
  criticalCount: number;
}

const TABS = [
  { name: 'Upload', icon: FileText },
  { name: 'Live', icon: Mic },
  { name: 'Text Analysis', icon: Search },
  { name: 'Analytics', icon: BarChart2 },
  { name: 'Incident Log', icon: List },
];

export function AppLayout({ children, activeTab, setActiveTab, criticalCount }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 bg-white/40 backdrop-blur-3xl flex flex-col hidden md:flex shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-black/5">
          <ShieldAlert className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">VoiceShield AI</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">
            Main Menu
          </div>
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-[0_2px_10px_rgba(139,92,246,0.1)] border border-primary/20" 
                    : "text-slate-600 hover:bg-black/5 hover:text-slate-900 border border-transparent"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-slate-400")} />
                {tab.name}
                {idx === 4 && criticalCount > 0 && (
                  <span className="ml-auto bg-destructive/90 backdrop-blur-md text-white py-0.5 px-2 rounded-full text-[10px] shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-destructive/20">
                    {criticalCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-black/5">
          <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-black/5 hover:text-slate-900 border border-transparent transition-all">
            <Settings className="mr-3 h-5 w-5 text-slate-400" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {TABS[activeTab].name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 bg-secondary/50 border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all focus:bg-secondary"
              />
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
              <Bell className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs cursor-pointer hover:bg-primary/20 transition-colors">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-transparent">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
