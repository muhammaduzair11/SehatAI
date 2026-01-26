export enum CallMode {
  IDLE = 'IDLE',
  INBOUND = 'INBOUND', // Patient calling clinic
  OUTBOUND = 'OUTBOUND', // Clinic calling patient (Reminder)
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export enum View {
  HOME = 'HOME',
  SIMULATION = 'SIMULATION',
  DASHBOARD = 'DASHBOARD',
}

export interface Appointment {
  id: string;
  patientName: string;
  phoneNumber: string;
  isNewPatient: boolean;
  dateTime: string;
  status: 'booked' | 'confirmed' | 'cancelled' | 'pending';
  notes?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'tool' | 'error' | 'transcription';
  message: string;
  details?: any;
}

export interface LastAction {
  id: string;
  type: 'booking' | 'reminder' | 'transfer' | 'termination';
  title: string;
  description: string;
  data?: any;
  status: 'success' | 'failed';
}

// Tool Arguments Types
export interface BookAppointmentArgs {
  patientName: string;
  phoneNumber: string;
  isNewPatient: boolean;
  dateTime: string;
}

export interface ConfirmReminderArgs {
  appointmentId: string;
  confirmed: boolean;
}