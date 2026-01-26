import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto z-50">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-slate-400 rounded-full px-2 py-2 flex lg:flex-col gap-2 shadow-2xl shadow-slate-900/20">
        
        {/* Brand Icon (Hidden on mobile, top on desktop) */}
        <div className="hidden lg:flex h-12 w-12 items-center justify-center mb-2 text-white font-bold tracking-tighter">
          SA
        </div>

        <NavItem 
          active={currentView === View.HOME} 
          onClick={() => onNavigate(View.HOME)}
          icon={<HomeIcon />} 
          label="Home"
        />
        <NavItem 
          active={currentView === View.SIMULATION} 
          onClick={() => onNavigate(View.SIMULATION)}
          icon={<MicrophoneIcon />} 
          label="Simulation"
        />
        <NavItem 
          active={currentView === View.DASHBOARD} 
          onClick={() => onNavigate(View.DASHBOARD)}
          icon={<ChartIcon />} 
          label="Data"
        />
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative group h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
      active 
        ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.5)]' 
        : 'hover:bg-slate-800 hover:text-white'
    }`}
    title={label}
  >
    <span className="w-5 h-5">{icon}</span>
    
    {/* Tooltip for Desktop */}
    <span className="absolute left-14 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block pointer-events-none">
      {label}
    </span>
  </button>
);

const HomeIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const MicrophoneIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const ChartIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;