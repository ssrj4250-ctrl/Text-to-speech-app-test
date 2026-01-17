
import React, { useState, useRef, useEffect } from 'react';
import { VOICES, Icons } from './constants';
import { VoiceConfig, AppStatus, GenerationHistoryItem } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, bufferToMp3Blob } from './utils/audioUtils';

const App: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(VOICES[0]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  
  // Voice modification states
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<string>("normal");

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Load history and settings from localStorage on mount
  useEffect(() => {
    // History
    const savedHistory = localStorage.getItem('voxpro_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({ ...item, audioBlob: undefined })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Settings
    const savedSettings = localStorage.getItem('voxpro_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.speed !== undefined) setSpeed(settings.speed);
        if (settings.pitch !== undefined) setPitch(settings.pitch);
        if (settings.voiceLabel && settings.voiceId) {
          const voice = VOICES.find(v => v.label === settings.voiceLabel && v.id === settings.voiceId);
          if (voice) setSelectedVoice(voice);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      speed,
      pitch,
      voiceId: selectedVoice.id,
      voiceLabel: selectedVoice.label
    };
    localStorage.setItem('voxpro_settings', JSON.stringify(settings));
  }, [speed, pitch, selectedVoice]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      initAudioContext();
      const base64 = await generateSpeech(
        text, 
        selectedVoice.id, 
        selectedVoice.instruction,
        speed,
        pitch
      );
      const audioData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current!, 24000, 1);
      
      const mp3Blob = bufferToMp3Blob(audioBuffer);
      const url = URL.createObjectURL(mp3Blob);

      const newItem: GenerationHistoryItem = {
        id: crypto.randomUUID(),
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        voiceId: selectedVoice.label,
        timestamp: Date.now(),
        audioBlob: mp3Blob
      };

      const newHistory = [newItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('voxpro_history', JSON.stringify(newHistory.map(h => ({ ...h, audioBlob: undefined }))));

      setCurrentAudioUrl(url);
      playAudio(audioBuffer);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handlePreview = async (voice: VoiceConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewId) return;

    setPreviewId(`${voice.id}-${voice.label}`);
    try {
      initAudioContext();
      const previewText = `Hello! I am your ${voice.label} voice. I am designed to be ${voice.name.toLowerCase()}. How can I help you today?`;
      const base64 = await generateSpeech(
        previewText, 
        voice.id, 
        voice.instruction,
        1.0, // Previews always at normal speed
        "normal" // Previews always at normal pitch
      );
      const audioData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current!, 24000, 1);
      
      playAudio(audioBuffer, true);
    } catch (err) {
      console.error("Preview failed", err);
    } finally {
      setPreviewId(null);
    }
  };

  const playAudio = (buffer: AudioBuffer, isPreview = false) => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    source.onended = () => {
      if (!isPreview && status !== AppStatus.GENERATING) {
        setStatus(AppStatus.IDLE);
      }
    };
    
    source.start(0);
    sourceRef.current = source;
    if (!isPreview) setStatus(AppStatus.PLAYING);
  };

  const handleStop = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      setStatus(AppStatus.IDLE);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('voxpro_history', JSON.stringify(updated.map(h => ({ ...h, audioBlob: undefined }))));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Icons.Wave className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">VoxPro TTS</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Professional Speech Engine</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-semibold border border-indigo-100">
            MP3 Output
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-1">
               <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your script here... Use punctuation to guide the AI's natural rhythm."
                className="w-full min-h-[360px] p-6 text-lg text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none transition-all"
              />
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-sm font-medium">{text.length} characters</span>
              </div>
              <div className="flex items-center gap-3">
                {status === AppStatus.PLAYING ? (
                  <button 
                    onClick={handleStop}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Icons.Stop className="w-5 h-5" />
                    Stop
                  </button>
                ) : (
                  <button 
                    onClick={handleGenerate}
                    disabled={status === AppStatus.GENERATING || !text.trim()}
                    className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95 ${
                      status === AppStatus.GENERATING || !text.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
                  >
                    {status === AppStatus.GENERATING ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Icons.Play className="w-5 h-5 fill-current" />
                        Generate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="bg-red-200 text-red-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">!</span>
              {error}
            </div>
          )}

          {currentAudioUrl && status !== AppStatus.GENERATING && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
               <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Active Output</h3>
               <audio controls src={currentAudioUrl} className="w-full h-10" />
               <div className="mt-4 flex justify-end">
                 <a 
                   href={currentAudioUrl} 
                   download="voxpro-tts-export.mp3"
                   className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors"
                 >
                   <Icons.Download className="w-4 h-4" />
                   Download MP3
                 </a>
               </div>
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Recent Activity</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">Your audio history will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="group relative flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 line-clamp-1 font-medium mb-1">{item.text}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{item.voiceId}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteHistory(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Audio Tuning Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              Voice Tuning
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed</label>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 px-0.5">
                  <span className="text-[10px] text-slate-300 font-medium">Slower</span>
                  <span className="text-[10px] text-slate-300 font-medium">Faster</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pitch</label>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded capitalize">{pitch}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'normal', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPitch(p)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                        pitch === p 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-h-[600px] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Icons.Mic className="w-4 h-4 text-indigo-600" />
              Voice Selection
            </h3>
            <div className="grid gap-3">
              {VOICES.map((voice) => {
                const vid = `${voice.id}-${voice.label}`;
                const isPreviewing = previewId === vid;
                return (
                  <button
                    key={vid}
                    onClick={() => setSelectedVoice(voice)}
                    className={`group p-4 rounded-xl border-2 text-left transition-all relative ${
                      selectedVoice.label === voice.label && selectedVoice.id === voice.id
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${selectedVoice.label === voice.label ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {voice.label}
                      </span>
                      <button
                        onClick={(e) => handlePreview(voice, e)}
                        disabled={isPreviewing}
                        className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isPreviewing 
                          ? 'bg-indigo-100 text-indigo-600 border-indigo-200' 
                          : 'bg-white text-slate-400 border-slate-100 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm'
                        }`}
                        title="Play Voice Preview"
                      >
                        {isPreviewing ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                        ) : (
                          <Icons.Speaker className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pr-8">{voice.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                        voice.gender === 'female' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {voice.gender}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              <Icons.Wave className="w-5 h-5" />
            </div>
            <span className="text-slate-500 font-bold tracking-tight">VoxPro TTS</span>
          </div>
          <div className="text-slate-400 text-sm font-medium">
            AI Persona Synthesis • 128kbps MP3
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600">API Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
