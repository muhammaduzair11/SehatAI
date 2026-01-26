import React from 'react';
import { View, Appointment } from '../../types';

interface HomeViewProps {
  onNavigate: (view: View) => void;
  appointments: Appointment[];
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden bg-slate-50">
      
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold tracking-widest uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Pakistan's First Voice AI
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          The Future of Care <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
            Is Voice.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg lg:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Sehat AI is an autonomous front-desk agent that speaks native Urdu. <br className="hidden lg:block"/>
          It books appointments, sends reminders, and never sleeps.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => onNavigate(View.SIMULATION)}
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4"></div>
            <span className="relative flex items-center gap-2 justify-center">
              Test Voice Agent
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </span>
          </button>

          <button 
            onClick={() => onNavigate(View.DASHBOARD)}
            className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:text-slate-900 transition-colors w-full sm:w-auto"
          >
            View Live Dashboard
          </button>
        </div>

        {/* Tech Stack / Trust Badges */}
        <div className="pt-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4">Powered By</p>
          <div className="flex items-center justify-center gap-8 lg:gap-12">
            <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              Google Gemini 2.0
            </span>
            <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              Real-time WebRTC
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};