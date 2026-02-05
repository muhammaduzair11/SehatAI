# PRD — SehatAI Voice Receptionist (MVP)

## 1. Summary
SehatAI is a voice-enabled virtual receptionist for clinics that answers calls, books appointments, and confirms reminders in Urdu (Roman) with English support. It runs as a web app and uses Gemini for real-time voice AI, with a local speech fallback for low-cost demos.

## 2. Goals
- Provide a realistic, end-to-end demo of a clinic voice receptionist.
- Automate inbound appointment booking and outbound reminder confirmation.
- Maintain a simple, low-cost deployment footprint.

## 3. Non-Goals
- Medical advice or diagnosis.
- Full telephony integration (PSTN) in MVP.
- Persistent backend storage in MVP.

## 4. Target Users
- Clinic owners and managers in Pakistan.
- Front-desk staff who handle patient calls.

## 5. Primary Use Cases
1. **Inbound booking**: Patient calls to book an appointment; assistant collects name, phone, new/returning status, and preferred time; confirms and saves.
2. **Outbound reminders**: Clinic calls a patient to confirm a pending appointment; assistant records confirmation or cancellation.

## 6. Key Features (MVP)
- Voice-driven call simulation (inbound/outbound).
- Structured appointment flow with confirmation before save.
- Real-time voice AI via Gemini (primary).
- Local Web Speech fallback mode (no API key).
- Live dashboard view of appointments and statuses.
- Call logs and action notifications.

## 7. User Experience
- **Home view**: product intro and navigation.
- **Simulation view**: start inbound/outbound calls, visualize audio activity, see latest logs.
- **Dashboard view**: appointments list with status and KPIs.

## 8. Success Metrics
- Users can complete a full inbound booking within 2 minutes.
- Users can confirm an outbound reminder in under 30 seconds.
- Demo runs without setup errors on Chrome/Edge.

## 9. Functional Requirements
- Capture microphone input and play AI audio responses.
- Maintain an in-memory appointment list.
- Confirm details before any appointment update.
- Display state (connecting/connected/error).
- Provide clear failure messages when voice APIs are unavailable.

## 10. Non-Functional Requirements
- Works on modern Chromium browsers.
- Handles unstable network gracefully (Gemini mode).
- Minimal setup cost: local demo mode without API key.
- No PII storage beyond session memory (MVP).

## 11. Risks & Mitigations
- **Speech API availability**: Use local mode fallback.
- **AI hallucinated appointment IDs**: Fuzzy name matching in reminders.
- **No persistence**: Communicate MVP limitations clearly.

## 12. Competitive Differentiation
- Clinic-specific voice workflows (Urdu-first).
- Dual-mode AI stack (Gemini + local speech fallback) for low-cost demos.
- Real-time call simulation with visible operational dashboard.

## 13. Future Roadmap
- Persistent backend and multi-clinic accounts.
- Telephony integration (Twilio or equivalent).
- Analytics, QA tools, and call recordings.
- Additional languages beyond Urdu.
