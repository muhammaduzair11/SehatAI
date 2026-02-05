# SehatAI Voice Receptionist — Rebuild Blueprint

## 1. Product Overview
- SehatAI is a voice receptionist for clinics, automating appointment booking and reminders in Urdu/English.
- Users interact via a web UI simulating inbound (patient calls) and outbound (clinic reminders) calls.
- Real-time speech recognition, voice synthesis, and structured tool execution.

## 2. User Experience & UI Design
### Main Views
- **Home:** Project intro, CTA to test agent or view dashboard.
- **Simulation:** Start inbound/outbound call, see live logs, volume, and call status.
- **Dashboard:** List of appointments, statuses, and recent activity.
- **Sidebar:** Navigation with AL initials, Home, Simulation, Dashboard icons.

### UI Technologies
- React (functional components, hooks)
- Tailwind CSS (CDN, utility classes)
- Responsive, modern, accessible design

### Key UI Components
- Sidebar navigation (SA initials, icons)
- Simulation orb (visualizes call state/volume)
- Toast notifications (success/error)
- Appointment cards (dashboard)

## 3. Core User Flows
### Inbound Call (Booking)
1. User starts inbound call.
2. System greets: "Assalam-o-Alaikum, SehatAI se bol rahe hain. Ji farmayein?"
3. Collects: Name → Phone → New/Returning → Preferred Time.
4. Confirms all details: "Confirm kar dein: Naam [Name], number [Phone], time [Time]. Kya yeh sahi hai?"
5. On yes, books appointment, says goodbye, ends call.

### Outbound Call (Reminder)
1. User starts outbound call (for pending appointment).
2. System greets: "Assalam-o-Alaikum, [Name] ki appointment hai [Time]. Kya aap aa rahay hain?"
3. Waits for yes/no, updates status, says goodbye, ends call.

## 4. Architecture Overview
### Frontend
- React + TypeScript (SPA)
- Vite for dev/build
- State managed in React (useState, useRef, useEffect)
- All logic in-browser (no backend in MVP)

### AI/Voice
- Google Gemini 2.5 Flash Native Audio (via @google/genai)
- Web Speech API for local mode (SpeechRecognition, SpeechSynthesis)
- Audio processing utilities (PCM ↔ Float32, resampling)

### Data Model
- Appointment: id, patientName, phoneNumber, isNewPatient, dateTime, status
- LogEntry: id, timestamp, type, message
- LastAction: id, type, title, description, status

### Environment
- .env.local for API keys and mode
- Vercel/Netlify for deployment (set env vars in dashboard)

## 5. File/Folder Structure
- App.tsx — main app logic, routing, state
- constants.ts — system instructions, initial data
- types.ts — TypeScript types/enums
- hooks/useLiveSession.ts — core call/session logic
- components/Sidebar.tsx — navigation
- components/views/ — HomeView, SimulationView, DashboardView
- utils/audioUtils.ts — audio conversions
- index.html, index.tsx — entry points

## 6. System Instructions (AI Prompt)
- Role: SehatAI, polite, patient, helpful
- Always confirm details before tool execution
- Never end call before explicit confirmation
- Use Urdu (Roman) for all speech
- See constants.ts for full prompt

## 7. Tech Stack
- React, TypeScript, Vite, Tailwind CSS
- Google Gemini API (prod), Web Speech API (local)
- No backend (MVP), browser state only

## 8. Deployment
- Vercel/Netlify: set VITE_USE_GEMINI and VITE_API_KEY in environment variables
- Run `npm install` then `npm run build` and deploy `dist/`

## 9. Rebuild Steps
1. Scaffold React+Vite+TS project
2. Add Tailwind via CDN in index.html
3. Implement types.ts, constants.ts, utils/audioUtils.ts
4. Build Sidebar, HomeView, SimulationView, DashboardView
5. Implement useLiveSession hook for call logic
6. Connect Gemini API or Web Speech API
7. Add state management and UI feedback (logs, notifications)
8. Test inbound/outbound flows
9. Deploy and set environment variables

## 10. Extensibility
- Add backend for persistent storage
- Multi-clinic, user roles, analytics
- Integrate with EHR/clinic management systems
- Multi-language support

## 11. References
- See all .ts/.tsx files for implementation details
- constants.ts for system prompt
- hooks/useLiveSession.ts for call/session logic
- components/views/ for UI patterns
