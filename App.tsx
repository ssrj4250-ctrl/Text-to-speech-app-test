
import React, { useState, useRef, useEffect } from 'react';
import { VOICES, Icons } from './constants';
import { VoiceConfig, AppStatus, GenerationHistoryItem } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, bufferToWavBlob } from './utils/audioUtils';

const App: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(VOICES[0]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Load history from local storage
    const saved = localStorage.getItem('voxpro_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({ ...item, audioBlob: undefined })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to convert.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const base64 = await generateSpeech(text, selectedVoice.id);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      const wavBlob = bufferToWavBlob(audioBuffer);
      const url = URL.createObjectURL(wavBlob);

      const newItem: GenerationHistoryItem = {
        id: crypto.randomUUID(),
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        voiceId: selectedVoice.id,
        timestamp: Date.now(),
        audioBlob: wavBlob
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

  const playAudio = (buffer: AudioBuffer) => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    source.onended = () => setStatus(AppStatus.IDLE);
    
    source.start(0);
    sourceRef.current = source;
    setStatus(AppStatus.PLAYING);
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
      {/* Header */}
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
            v2.5 Flash
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-1">
               <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your script here... Experience natural pauses and professional intonation."
                className="w-full min-h-[320px] p-6 text-lg text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none transition-all"
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
                    Stop Playing
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
                        Generate Speech
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
                   download="voxpro-tts-export.wav"
                   className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors"
                 >
                   <Icons.Download className="w-4 h-4" />
                   Download WAV
                 </a>
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Voices & History */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Icons.Mic className="w-4 h-4 text-indigo-600" />
              Voice Selection
            </h3>
            <div className="grid gap-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedVoice.id === voice.id 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${selectedVoice.id === voice.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {voice.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${
                      voice.gender === 'female' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {voice.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{voice.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Recent Generations</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <Icons.Wave className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="group relative flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 line-clamp-2 font-medium mb-1">{item.text}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.voiceId}</span>
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
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
              <Icons.Wave className="w-5 h-5" />
            </div>
            <span className="text-slate-500 font-bold tracking-tight">VoxPro TTS</span>
          </div>
          <div className="text-slate-400 text-sm font-medium">
            Powered by Gemini AI • 24kHz High Fidelity PCM
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
