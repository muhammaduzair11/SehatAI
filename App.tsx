import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/views/HomeView';
import { SimulationView } from './components/views/SimulationView';
import { DashboardView } from './components/views/DashboardView';
import { useLiveSession } from './hooks/useLiveSession';
import { Appointment, CallMode, LogEntry, View, ConnectionState, LastAction } from './types';
import { INITIAL_APPOINTMENTS as INIT_DATA, SYSTEM_INSTRUCTION as SYS_INSTR } from './constants';

const API_KEY = (import.meta as any).env?.VITE_API_KEY || '';
const USE_GEMINI = (import.meta as any).env?.VITE_USE_GEMINI === 'true';
const EFFECTIVE_API_KEY = USE_GEMINI ? API_KEY : '';
const IS_LOCAL_MODE = !EFFECTIVE_API_KEY;

const App: React.FC = () => {
  // Global State
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_DATA);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [callMode, setCallMode] = useState<CallMode>(CallMode.IDLE);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [isLocalMode] = useState(IS_LOCAL_MODE);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Refs for access inside callbacks
  const appointmentsRef = useRef(appointments);
  const sessionSuccessRef = useRef(false);
  const disconnectRef = useRef<() => void>(() => {});

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      message
    }]);
  }, []);

  // --- BACKEND LOGIC (The "Brain") ---
  const handleToolCall = useCallback(async (name: string, args: any) => {
    const safeArgs = args || {};
    addLog(`🛠️ Tool: ${name}`, 'tool');

    try {
      switch (name) {
        case 'book_appointment': {
          const rawName = safeArgs.patientName ? String(safeArgs.patientName).trim() : 'Guest Patient';
          const rawTime = safeArgs.dateTime ? String(safeArgs.dateTime) : 'Upcoming';
          const rawPhone = safeArgs.phoneNumber ? String(safeArgs.phoneNumber) : 'No Number';
          
          let isNew = false;
          if (String(safeArgs.isNewPatient).toLowerCase() === 'true') isNew = true;

          const cleanName = rawName.replace(/\b\w/g, (l) => l.toUpperCase());
          
          const newAppt: Appointment = {
            id: Math.random().toString(36).substring(7),
            patientName: cleanName,
            phoneNumber: rawPhone,
            isNewPatient: isNew,
            dateTime: rawTime,
            status: 'booked'
          };
          
          setAppointments(prev => [newAppt, ...prev]); 
          sessionSuccessRef.current = true;
          
          setNotification({ message: `Appointment Booked: ${cleanName}`, type: 'success' });
          setLastAction({
            id: Date.now().toString(),
            type: 'booking',
            title: 'Booking Confirmed',
            description: `${cleanName} - ${rawTime}`,
            status: 'success'
          });

          return { success: true, appointmentId: newAppt.id };
        }

        case 'confirm_reminder': {
          const currentAppointments = appointmentsRef.current;
          let targetAppt = currentAppointments.find(a => a.id === safeArgs.appointmentId);

          // 🛡️ FUZZY MATCHING FAILSAFE
          // If ID lookup fails, try to find by name (AI sometimes hallucinates IDs)
          if (!targetAppt && safeArgs.patientName) {
             const searchName = String(safeArgs.patientName).toLowerCase();
             targetAppt = currentAppointments.find(a => a.patientName.toLowerCase().includes(searchName));
             if (targetAppt) {
                 addLog(`⚠️ ID Mismatch. Recovered via name match: ${targetAppt.patientName}`, 'info');
             }
          }

          if (!targetAppt) {
             addLog(`❌ Failed to find appointment. ID: ${safeArgs.appointmentId}`, 'error');
             // Return success anyway to keep the flow smooth for the user, but log the error
             return { success: false, error: "Appointment not found" };
          }

          const confirmed = String(safeArgs.confirmed).toLowerCase() === 'true';
          const newStatus = confirmed ? 'confirmed' : 'cancelled';

          setAppointments(prev => prev.map(appt => {
            if (appt.id === targetAppt?.id) {
              return { ...appt, status: newStatus };
            }
            return appt;
          }));

          sessionSuccessRef.current = true;
          setNotification({ message: `Status Updated: ${newStatus.toUpperCase()}`, type: 'success' });
          
          setLastAction({
            id: Date.now().toString(),
            type: 'reminder',
            title: confirmed ? 'Confirmed' : 'Cancelled',
            description: `${targetAppt.patientName} is ${newStatus}`,
            status: 'success'
          });

          return { success: true, status: newStatus };
        }

        case 'end_call': {
          addLog("Call completion requested.", 'info');
          
          // 3-second grace period for "Allah Hafiz" to play out
          setTimeout(() => {
            disconnectRef.current();
            setCallMode(CallMode.IDLE);
            
            if (sessionSuccessRef.current) {
               addLog("🚀 Redirecting to Dashboard...", 'info');
               setCurrentView(View.DASHBOARD);
               sessionSuccessRef.current = false;
            } else {
               addLog("Session ended without data change.", 'info');
            }
          }, 3000);

          return { success: true };
        }

        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (error: any) {
      addLog(`System Error: ${error.message}`, 'error');
      return { error: "Internal Error" };
    }
  }, [addLog]);

  // --- CONNECTION HOOK ---
  const { connect, disconnect, connectionState, volumeLevel } = useLiveSession({
    apiKey: EFFECTIVE_API_KEY,
    onLog: addLog,
    onToolCall: handleToolCall,
    systemInstruction: SYS_INSTR
  });

  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);


  // --- NAVIGATION & ACTIONS ---
  const startInboundCall = () => {
    setLastAction(null);
    setLogs([]);
    sessionSuccessRef.current = false;
    setCallMode(CallMode.INBOUND);
    connect(CallMode.INBOUND);
  };

  const startOutboundCall = () => {
    setLastAction(null);
    setLogs([]);
    sessionSuccessRef.current = false;
    const target = appointments.find(a => a.status === 'pending');
    
    if (target) {
        addLog(`Dialing ${target.patientName}...`, 'info');
        setCallMode(CallMode.OUTBOUND);
        connect(CallMode.OUTBOUND, target);
    } else {
        setNotification({ message: "No pending appointments", type: 'error' });
    }
  };

  const endCall = () => {
    disconnect();
    setCallMode(CallMode.IDLE);
  };

  // --- VIEW RENDERING ---
  const renderView = () => {
    switch(currentView) {
      case View.HOME:
        return <HomeView onNavigate={setCurrentView} appointments={appointments} />;
      case View.SIMULATION:
        return (
          <SimulationView 
            connectionState={connectionState}
            callMode={callMode}
            volumeLevel={volumeLevel}
            logs={logs}
            lastAction={lastAction}
            onStartInbound={startInboundCall}
            onStartOutbound={startOutboundCall}
            onEndCall={endCall}
            notification={notification}
            isLocalMode={isLocalMode}
          />
        );
      case View.DASHBOARD:
        return <DashboardView appointments={appointments} />;
      default:
        return <HomeView onNavigate={setCurrentView} appointments={appointments} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-white font-sans text-slate-900 overflow-hidden relative">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="h-full w-full">
        {renderView()}
      </main>
    </div>
  );
};

export default App;