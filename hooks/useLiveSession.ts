import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { AudioUtils } from '../utils/audioUtils';
import { CallMode, ConnectionState, Appointment } from '../types';

// Constants for Audio
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

interface UseLiveSessionProps {
  apiKey: string;
  onLog: (message: string, type?: 'info' | 'tool' | 'error' | 'transcription') => void;
  onToolCall: (name: string, args: any) => Promise<any>;
  systemInstruction: string;
}

export const useLiveSession = ({ apiKey, onLog, onToolCall, systemInstruction }: UseLiveSessionProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volumeLevel, setVolumeLevel] = useState(0); 

  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const aiClientRef = useRef<GoogleGenAI | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const localStateRef = useRef<{
    mode: CallMode | null;
    stage: 'idle' | 'collect_name' | 'collect_phone' | 'collect_new' | 'collect_time' | 'confirm_details' | 'outbound_confirm' | 'complete';
    collected: Partial<Appointment> & { isNewPatient?: boolean };
    contextData?: Appointment;
  }>({ mode: null, stage: 'idle', collected: {} });

  // Initialize AI Client
  useEffect(() => {
    if (apiKey) {
      aiClientRef.current = new GoogleGenAI({ apiKey });
    }
  }, [apiKey]);

  const safeStartRecognition = useCallback(() => {
    try {
      recognitionRef.current?.start();
    } catch (e) {}
  }, []);

  const safeStopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  }, []);

  const speakText = useCallback(async (text: string) => {
    onLog(text, 'info');
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    safeStopRecognition();

    return new Promise<void>((resolve) => {
      isSpeakingRef.current = true;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ur-PK';
      utter.rate = 1;
      utter.pitch = 1;
      utter.onend = () => {
        isSpeakingRef.current = false;
        if (isConnectedRef.current) safeStartRecognition();
        resolve();
      };
      utter.onerror = () => {
        isSpeakingRef.current = false;
        if (isConnectedRef.current) safeStartRecognition();
        resolve();
      };
      window.speechSynthesis.speak(utter);
    });
  }, [onLog, safeStartRecognition, safeStopRecognition]);

  const normalizeText = (text: string) => text
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const toTitleCase = (text: string) => text
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const extractPhone = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length < 7) return '';
    if (digits.length === 11) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return digits;
  };

  const extractName = (text: string) => {
    const match = text.match(/(?:mera naam|my name is|naam|mai|main)\s+([a-zA-Z\s]+)/i);
    const raw = match?.[1] ? match[1] : text;
    const cleaned = raw.replace(/\b(hai|ho|hun|ji)\b/gi, '').trim();
    return toTitleCase(cleaned || text);
  };

  const extractDateTime = (text: string) => {
    if (!text) return '';
    return text;
  };

  const detectYesNo = (text: string) => {
    const yesTokens = ['haan', 'han', 'jee', 'ji', 'yes', 'bilkul', 'theek', 'ok', 'confirm', 'haa'];
    const noTokens = ['nahin', 'nahi', 'no', 'cancel', 'nain', 'nah', 'na'];
    const hasYes = yesTokens.some(t => text.includes(t));
    const hasNo = noTokens.some(t => text.includes(t));
    if (hasYes && !hasNo) return true;
    if (hasNo && !hasYes) return false;
    return null;
  };

  const updateVolumeFromAnalyser = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setVolumeLevel(Math.min(100, Math.round(rms * 200)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const connect = useCallback(async (mode: CallMode, contextData?: any) => {
    if (!aiClientRef.current && apiKey) {
      onLog("API Key missing", 'error');
      return;
    }

    if (!apiKey) {
      try {
        setConnectionState(ConnectionState.CONNECTING);
        onLog(`Starting local ${mode} session...`, 'info');

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          onLog('Speech Recognition is not supported in this browser.', 'error');
          setConnectionState(ConnectionState.ERROR);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        source.connect(analyser);
        updateVolumeFromAnalyser();

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'ur-PK';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (!result.isFinal) continue;
            const transcript = result[0].transcript || '';
            const normalized = normalizeText(transcript);
            if (!normalized || !isConnectedRef.current) return;

            onLog(`User: ${transcript}`, 'transcription');

            const state = localStateRef.current;
            if (state.mode === CallMode.OUTBOUND) {
              const answer = detectYesNo(normalized);
              if (answer === null) {
                speakText('Maazrat, samajh nahi aaya. Kya aap confirm kar rahe hain?');
                return;
              }

              if (state.contextData) {
                onToolCall('confirm_reminder', {
                  appointmentId: state.contextData.id,
                  patientName: state.contextData.patientName,
                  confirmed: answer
                }).then(() => {
                  speakText('Update kar diya. Allah Hafiz.');
                  onToolCall('end_call', {});
                  disconnect();
                });
              }
              return;
            }

            if (state.mode === CallMode.INBOUND) {
              const collected = state.collected;

              if (state.stage === 'collect_name') {
                collected.patientName = extractName(transcript);
                state.stage = 'collect_phone';
                speakText('Shukriya. Apna phone number batayein.');
                return;
              }

              if (state.stage === 'collect_phone') {
                const phone = extractPhone(transcript);
                if (!phone) {
                  speakText('Phone number dobara batayein, please.');
                  return;
                }
                collected.phoneNumber = phone;
                state.stage = 'collect_new';
                speakText('Kya aap pehli dafa aa rahe hain?');
                return;
              }

              if (state.stage === 'collect_new') {
                const yn = detectYesNo(normalized);
                if (yn === null) {
                  speakText('Maazrat, sirf haan ya nahi batayein.');
                  return;
                }
                collected.isNewPatient = yn;
                state.stage = 'collect_time';
                speakText('Kis din aur kis time appointment chahiye?');
                return;
              }

              if (state.stage === 'collect_time') {
                const time = extractDateTime(transcript);
                if (!time) {
                  speakText('Time dobara batayein, please.');
                  return;
                }
                collected.dateTime = time;
                state.stage = 'confirm_details';
                speakText(`Confirm kar dein: Naam ${collected.patientName}, number ${collected.phoneNumber}, time ${collected.dateTime}. Kya main save kar dun?`);
                return;
              }

              if (state.stage === 'confirm_details') {
                const yn = detectYesNo(normalized);
                if (yn === null) {
                  speakText('Maazrat, haan ya nahi batayein.');
                  return;
                }

                if (!yn) {
                  state.collected = {};
                  state.stage = 'collect_name';
                  speakText('Theek hai. Dobara bata dein, aapka naam?');
                  return;
                }

                onToolCall('book_appointment', {
                  patientName: collected.patientName || 'Guest Patient',
                  phoneNumber: collected.phoneNumber || 'No Number',
                  isNewPatient: Boolean(collected.isNewPatient),
                  dateTime: collected.dateTime || 'Upcoming'
                }).then(() => {
                  speakText('Appointment save ho gaya. Allah Hafiz.');
                  onToolCall('end_call', {});
                  disconnect();
                });
                return;
              }
            }
          }
        };

        recognition.onerror = (err: any) => {
          onLog(`Speech error: ${err?.error || 'unknown'}`, 'error');
        };

        recognition.onend = () => {
          if (isConnectedRef.current && !isSpeakingRef.current) {
            safeStartRecognition();
          }
        };

        setConnectionState(ConnectionState.CONNECTED);
        isConnectedRef.current = true;

        localStateRef.current = {
          mode,
          stage: mode === CallMode.OUTBOUND ? 'outbound_confirm' : 'collect_name',
          collected: {},
          contextData: contextData as Appointment | undefined
        };

        if (mode === CallMode.OUTBOUND && contextData) {
          await speakText(`Assalam-o-Alaikum, ${contextData.patientName} ki appointment hai ${contextData.dateTime}. Kya aap aa rahay hain?`);
        } else {
          await speakText('Assalam-o-Alaikum, Sehat Clinic. Ji farmayein?');
          await speakText('Apna naam batayein, please.');
        }

        safeStartRecognition();
        return;
      } catch (error: any) {
        onLog(`Connection Error: ${error.message}`, 'error');
        setConnectionState(ConnectionState.ERROR);
        disconnect();
        return;
      }
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      onLog(`Initializing ${mode} session...`, 'info');

      // 1. Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: INPUT_SAMPLE_RATE
        } 
      });
      mediaStreamRef.current = stream;

      // 2. Setup Audio Contexts
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      // 3. Define Tools
      const bookAppointmentTool: FunctionDeclaration = {
        name: 'book_appointment',
        description: 'Book a new appointment.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            phoneNumber: { type: Type.STRING },
            isNewPatient: { type: Type.BOOLEAN },
            dateTime: { type: Type.STRING },
          },
          required: ['patientName', 'phoneNumber', 'isNewPatient', 'dateTime'],
        },
      };

      const confirmReminderTool: FunctionDeclaration = {
        name: 'confirm_reminder',
        description: 'Update appointment status.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            appointmentId: { type: Type.STRING },
            patientName: { type: Type.STRING, description: 'Backup name if ID fails' },
            confirmed: { type: Type.BOOLEAN },
          },
          required: ['appointmentId', 'confirmed'],
        },
      };

      const endCallTool: FunctionDeclaration = {
        name: 'end_call',
        description: 'End the call immediately after saying goodbye.',
        parameters: { type: Type.OBJECT, properties: {} },
      };
      
      const tools = [{ functionDeclarations: [bookAppointmentTool, confirmReminderTool, endCallTool] }];

      // 4. Construct Context
      const currentSystemInstruction = mode === CallMode.OUTBOUND && contextData 
        ? `${systemInstruction}\n\n[CONTEXT: Calling ${contextData.patientName}. ID: ${contextData.id}. Time: ${contextData.dateTime}]`
        : systemInstruction;

      const sessionPromise = aiClientRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
          systemInstruction: currentSystemInstruction,
          tools: tools,
        },
        callbacks: {
          onopen: async () => {
            onLog("Connected. Listening...", 'info');
            setConnectionState(ConnectionState.CONNECTED);
            isConnectedRef.current = true;

            // Setup Audio Processing
            const source = audioCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!isConnectedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Volume Viz
              let sum = 0;
              for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolumeLevel(Math.sqrt(sum / inputData.length) * 1000); 

              const pcmData = AudioUtils.float32ToInt16(inputData);
              const base64Data = AudioUtils.arrayBufferToBase64(pcmData.buffer);
              
              sessionPromise.then(session => {
                  session.sendRealtimeInput({
                      media: { mimeType: 'audio/pcm;rate=' + audioCtx.sampleRate, data: base64Data }
                  });
              });
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            // Send initial trigger for Outbound only
            if (mode === CallMode.OUTBOUND) {
                setTimeout(() => {
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({
                            media: { mimeType: 'text/plain', data: btoa("Start conversation now.") }
                        });
                    });
                }, 500); // 500ms delay to stabilize connection
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (!isConnectedRef.current) return;

            // Handle Tools
            if (msg.toolCall) {
              const functionResponses = [];
              for (const fc of msg.toolCall.functionCalls) {
                try {
                   const result = await onToolCall(fc.name, fc.args);
                   functionResponses.push({ id: fc.id, name: fc.name, response: { result } });
                } catch (err: any) {
                    functionResponses.push({ id: fc.id, name: fc.name, response: { error: err.message } });
                }
              }
              sessionPromise.then(session => session.sendToolResponse({ functionResponses }));
            }

            // Handle Audio
            const modelAudio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (modelAudio) {
                const pcmBuffer = AudioUtils.base64ToArrayBuffer(modelAudio);
                const float32Data = AudioUtils.int16ToFloat32(new Int16Array(pcmBuffer));
                const buffer = audioCtx.createBuffer(1, float32Data.length, OUTPUT_SAMPLE_RATE);
                buffer.copyToChannel(float32Data, 0);

                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);
                
                const start = Math.max(audioCtx.currentTime, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
                
                scheduledSourcesRef.current.add(source);
                source.onended = () => scheduledSourcesRef.current.delete(source);
            }

            // Handle Interruptions
            if (msg.serverContent?.interrupted) {
              onLog("⚡ Interruption", 'info');
              scheduledSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              scheduledSourcesRef.current.clear();
              nextStartTimeRef.current = audioCtx.currentTime;
            }
          },
          onclose: () => {
             setConnectionState(ConnectionState.DISCONNECTED);
             isConnectedRef.current = false;
          },
          onerror: (err) => {
             onLog(`Error: ${err}`, 'error');
             setConnectionState(ConnectionState.ERROR);
          }
        }
      });
      
    } catch (error: any) {
      onLog(`Connection Error: ${error.message}`, 'error');
      setConnectionState(ConnectionState.ERROR);
      disconnect();
    }
  }, [apiKey, onLog, onToolCall, systemInstruction]);

  const disconnect = useCallback(() => {
    isConnectedRef.current = false;
    safeStopRecognition();
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch(e){}
      processorRef.current = null;
    }
    if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch(e){}
        sourceRef.current = null;
    }
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch(e){}
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e){}
      audioContextRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    setConnectionState(ConnectionState.DISCONNECTED);
    setVolumeLevel(0);
    scheduledSourcesRef.current.forEach(s => { try{s.stop()}catch(e){} });
    scheduledSourcesRef.current.clear();
  }, []);

  return { connect, disconnect, connectionState, volumeLevel };
};