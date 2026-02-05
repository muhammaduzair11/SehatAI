import React, { useState, useEffect } from 'react';
import { Appointment, CallMode, ConnectionState, LogEntry, LastAction } from '../../types';

interface SimulationViewProps {
  connectionState: ConnectionState;
  callMode: CallMode;
  volumeLevel: number;
  logs: LogEntry[];
  lastAction: LastAction | null;
  onStartInbound: () => void;
  onStartOutbound: () => void;
  onEndCall: () => void;
  notification: { message: string, type: 'success' | 'error' } | null;
   isLocalMode?: boolean;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  connectionState,
  callMode,
  volumeLevel,
  logs,
  lastAction,
  onStartInbound,
  onStartOutbound,
  onEndCall,
   notification,
   isLocalMode
}) => {
  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;
   const isError = connectionState === ConnectionState.ERROR;

  return (
    <div className="h-full w-full relative bg-slate-950 overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Background Ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black z-0"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] transition-all duration-1000 ${isConnected ? 'opacity-100 scale-100' : 'opacity-20 scale-50'}`}></div>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
             {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             )}
             {notification.message}
          </div>
        </div>
      )}

      {/* Header Status */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-start z-20">
         <div className="flex items-center gap-3">
             <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
             <span className="text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">
                 {isConnected ? 'System Online' : 'Standby Mode'}
             </span>
         </div>
             {isLocalMode && (
                <div className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                   Local Free Mode
                </div>
             )}
      </div>

      {/* MAIN ORB */}
      <div className="relative z-10 flex flex-col items-center justify-center">
         <div className="relative">
            {/* Ripples */}
            {isConnected && (
               <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-teal-500/30 rounded-full w-[400px] h-[400px] animate-[ping_3s_linear_infinite]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-teal-500/10 rounded-full w-[600px] h-[600px] animate-[ping_4s_linear_infinite] delay-700"></div>
               </>
            )}

            {/* Core */}
            <div 
               className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_100px_rgba(20,184,166,0.3)] backdrop-blur-md border border-white/10 ${
                  isConnected 
                  ? 'bg-gradient-to-br from-teal-400 to-emerald-600 scale-110 shadow-[0_0_120px_rgba(20,184,166,0.6)]' 
                  : 'bg-slate-900 border-slate-700'
               }`}
               style={{ transform: isConnected ? `scale(${1 + (volumeLevel / 200)})` : 'scale(1)' }}
            >
               {isConnecting ? (
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : (
                  <svg className={`w-12 h-12 text-white transition-opacity ${isConnected ? 'opacity-100' : 'opacity-20'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
               )}
            </div>
         </div>

         {/* AI Message / Context */}
         <div className="h-24 mt-12 text-center max-w-md w-full px-4 flex flex-col items-center justify-center">
             {isConnected ? (
                 <>
                   <span className="text-teal-400 font-bold text-sm tracking-widest uppercase mb-2 animate-pulse">Listening...</span>
                   {logs.length > 0 && (
                      <p className="text-white text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                        "{logs[logs.length - 1].type === 'tool' ? 'Processing request...' : logs[logs.length - 1].message.slice(0, 60) + (logs[logs.length - 1].message.length > 60 ? '...' : '')}"
                      </p>
                   )}
                 </>
                   ) : isError ? (
                         <div className="text-slate-300 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                            <div className="font-bold text-red-400 mb-1">Call failed to start</div>
                            <div className="text-slate-400">
                               Use Chrome or Edge, allow microphone access, and run on http://localhost.
                            </div>
                         </div>
                   ) : (
                         <p className="text-slate-500 text-lg">Select a mode to initialize SehatAI</p>
                   )}
         </div>
      </div>

      {/* ACTION CHIPS (Controls) */}
      <div className="absolute bottom-12 z-30 flex items-center justify-center gap-4">
         {!isConnected ? (
            <>
              <button 
                onClick={onStartInbound}
                className="group flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-xl shadow-white/5 hover:scale-105 transition-all duration-200"
              >
                 <div className="h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 015.516 5.517l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-slate-900">Inbound Call</div>
                    <div className="text-xs text-slate-500">Patient Booking</div>
                 </div>
              </button>

              <button 
                onClick={onStartOutbound}
                className="group flex items-center gap-3 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl hover:scale-105 transition-all duration-200"
              >
                 <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-white">Outbound Call</div>
                    <div className="text-xs text-slate-400">Confirmation</div>
                 </div>
              </button>
            </>
         ) : (
            <button 
              onClick={onEndCall}
              className="flex items-center gap-2 px-8 py-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all duration-300 animate-pulse"
            >
               <span className="h-2 w-2 bg-red-500 rounded-full"></span>
               End Session
            </button>
         )}
      </div>

    </div>
  );
};