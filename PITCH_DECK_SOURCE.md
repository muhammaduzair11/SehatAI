# Project Name
- SehatAI
- Voice receptionist for clinics in Urdu and English

# Problem
- Clinic front desks miss calls and fail to confirm appointments
- Missed calls lead to lost bookings and poor patient experience
- Manual confirmations are slow and inconsistent

- A voice receptionist that books and confirms appointments automatically
- Captures patient details and confirms reminders by voice
- Works in Urdu and English with real-time speech input and output

- What users see
  - A simulation interface with inbound and outbound call modes
  - Real-time call status, logs, and appointment updates
- What users do
  - Start an inbound call to book an appointment
  - Start an outbound call to confirm a pending appointment
  - End sessions and review booked or confirmed appointments
- What the system does behind the scenes
  - Collects speech, converts to text, and validates responses
  - Executes booking or confirmation tools
  - Updates appointment status and logs actions

# User Flow
- User opens the app and selects Simulation
- User starts an inbound or outbound call
- System greets and collects required details
- System confirms details and waits for explicit yes or no
- System saves or updates the appointment
- System says goodbye and ends the call
- User sees updated records in the dashboard

# Tech Stack
- Frontend
  - React
  - TypeScript
  - Vite
  - Tailwind via CDN
- Backend
  - None in current build
  - In-browser state and tool handlers
- AI / Models
  - Google Gemini 2.5 Flash Native Audio preview
- Infrastructure
  - Browser audio APIs
  - Vite dev server for local hosting

# Target Users
- Primary users
  - Clinic owners and managers in Pakistan
- Secondary users
  - Front-desk staff
  - Patients receiving reminders

# Use Cases
- Patient calls to book a new appointment
- Clinic calls patients to confirm tomorrow’s appointment
- Clinic updates appointment status after confirmation
- Staff reviews recent bookings and confirmations in the dashboard

# Competitive Advantage
- Urdu-first conversational flow tuned for local clinic workflows
- Real-time voice interaction with structured tool execution
- Simple deployment and local operation for demos

# Business Model
- Monthly subscription per clinic
- Tiered pricing based on number of calls per month

# Roadmap
- MVP
  - Inbound booking and outbound confirmation
  - Dashboard for appointments and status
- Short-term
  - Real backend storage
  - Multi-clinic accounts and user roles
  - Basic analytics
- Long-term
  - Integration with clinic management systems
  - Automated follow-ups and rescheduling
  - Multi-language expansion beyond Urdu

# Vision
- Reliable voice reception for clinics that reduces missed calls and improves patient follow-up within 1–3 years

# The Ask
- Feedback from clinic operators
- Pilot partners for real call data
- Funding to build backend, deployments, and integrations
