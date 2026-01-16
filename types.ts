
export interface VoiceConfig {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
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
