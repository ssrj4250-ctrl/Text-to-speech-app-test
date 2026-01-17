
export interface VoiceConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  instruction: string;
  previewUrl?: string;
}

export interface GenerationHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  timestamp: number;
  audioBlob?: Blob;
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  PLAYING = 'playing',
  ERROR = 'error'
}
