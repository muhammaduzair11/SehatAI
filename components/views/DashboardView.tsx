import React from 'react';
import { Appointment } from '../../types';

interface DashboardViewProps {
  appointments: Appointment[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ appointments }) => {
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="h-full w-full bg-slate-50 p-6 lg:p-12 overflow-y-auto">
       
       <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div>
                <h2 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">Clinic Dashboard</h2>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Real-Time Operations</h1>
             </div>
             <div className="text-right hidden md:block">
                <div className="text-slate-400 text-xs font-mono mb-1">{new Date().toLocaleDateString()}</div>
                <div className="flex items-center gap-2 justify-end">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span className="text-slate-700 font-bold text-sm">Live System</span>
                </div>
             </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <KpiCard title="Calls Handled" value={stats.total} subtitle="+12% from yesterday" color="slate" />
             <KpiCard title="Confirmed" value={stats.confirmed} subtitle="Automated confirmations" color="teal" />
             <KpiCard title="Pending Action" value={stats.pending} subtitle="Requires attention" color="amber" />
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Recent Appointments</h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">LIVE FEED</span>
             </div>
             
             <div className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                   <div className="p-12 text-center text-slate-400 italic">No appointments booked yet.</div>
                ) : (
                   appointments.map((appt) => (
                      <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                         <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                               appt.isNewPatient ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                               {appt.patientName.charAt(0)}
                            </div>
                            <div>
                               <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                  {appt.patientName}
                                  {appt.isNewPatient && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 font-bold uppercase tracking-wider">New</span>}
                               </div>
                               <div className="text-slate-500 text-sm font-medium">{appt.dateTime} • {appt.phoneNumber}</div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                               appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                               appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                               'bg-amber-100 text-amber-700'
                            }`}>
                               {appt.status}
                            </span>
                            <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>

       </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, color }: any) => {
   const colors: any = {
      teal: 'bg-teal-500 text-white',
      slate: 'bg-slate-900 text-white',
      amber: 'bg-white border border-slate-200 text-slate-900'
   };

   return (
      <div className={`p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${colors[color]}`}>
         <div className="relative z-10">
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${color === 'amber' ? 'text-slate-500' : 'text-white/70'}`}>{title}</div>
            <div className="text-5xl font-extrabold tracking-tight mb-2">{value}</div>
            <div className={`text-sm font-medium ${color === 'amber' ? 'text-amber-600' : 'text-white/80'}`}>{subtitle}</div>
         </div>
         {color === 'teal' && <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>}
      </div>
   )
}