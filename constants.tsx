
import React from 'react';
import { VoiceConfig } from './types';

export const VOICES: VoiceConfig[] = [
  { 
    id: 'Puck', 
    label: 'YouTube Narrator',
    name: 'Energetic Narrator', 
    description: 'Confident and lively. Perfect for engaging digital content.', 
    gender: 'male',
    instruction: 'Act as a professional YouTube narrator. Your voice must be confident, engaging, and slightly energetic. Use natural upward inflections at the end of interesting points and maintain a brisk but perfectly clear human pace.'
  },
  { 
    id: 'Kore', 
    label: 'Storyteller',
    name: 'Warm Storyteller', 
    description: 'Warm, emotional, and deeply engaging for long-form narratives.', 
    gender: 'female',
    instruction: 'Act as a professional audiobook narrator. Your voice should be warm, rich, and emotional. Use expressive pauses and a gentle, inviting tone. Let your voice slightly reflect the mood of the story as it unfolds.'
  },
  { 
    id: 'Fenrir', 
    label: 'Academic Tutor',
    name: 'Clear Teacher', 
    description: 'Methodical and articulate. Ideal for technical lessons.', 
    gender: 'male',
    instruction: 'Act as a university professor. Your voice must be slow, clear, and focused on articulation. Use methodical pacing with short pauses after complex terms to allow for listener comprehension. Maintain a respectful, intellectual gravitas.'
  },
  { 
    id: 'Zephyr', 
    label: 'School Teacher',
    name: 'Patient Educator', 
    description: 'Clear, patient, and nurturing for students.', 
    gender: 'female',
    instruction: 'Act as a kind elementary school teacher. Your voice should be slow, very clear, and patient. Use a nurturing, melodic tone and emphasize key words softly. Include natural, gentle breaths between sentences.'
  },
  { 
    id: 'Puck', 
    label: 'EduTuber',
    name: 'Engaging Educator', 
    description: 'Enthusiastic and clear. Great for educational videos.', 
    gender: 'male',
    instruction: 'Act as a high-energy educational content creator. Be enthusiastic but maintain total clarity. Your voice should sound like you are genuinely excited about the topic you are explaining.'
  },
  { 
    id: 'Zephyr', 
    label: 'Zen Guide',
    name: 'Meditation Coach', 
    description: 'Soft, airy, and incredibly calm for relaxation.', 
    gender: 'female',
    instruction: 'Act as a meditation guide. Use a very low, soft, and airy tone. Speak with significant breathiness and long, soothing pauses. Your voice should feel like a gentle whisper intended to induce total relaxation.'
  },
  { 
    id: 'Charon', 
    label: 'News Anchor',
    name: 'Professional News', 
    description: 'Neutral, authoritative, and perfectly objective.', 
    gender: 'male',
    instruction: 'Act as a veteran news anchor. Your tone must be professional, neutral, and authoritative. Avoid emotional exaggeration. Use a steady, rhythmic cadence that conveys facts with absolute confidence.'
  },
  { 
    id: 'Kore', 
    label: 'App Guide',
    name: 'Friendly Assistant', 
    description: 'Polite and conversational for interfaces.', 
    gender: 'female',
    instruction: 'Act as a friendly digital concierge. Your voice should be polite, helpful, and naturally conversational. Use a bright, pleasant tone and sound as if you are smiling while speaking.'
  },
  { 
    id: 'Fenrir', 
    label: 'Hindi Professor',
    name: 'Formal Hindi', 
    description: 'Formal and academic Hindi delivery.', 
    gender: 'male',
    instruction: 'Act as a formal Hindi instructor. Your delivery must be slow and articulate, utilizing pure and correct pronunciation. Maintain a respectful, academic, and traditional tone.'
  },
  { 
    id: 'Charon', 
    label: 'YouTube Teacher',
    name: 'Confident Tutor', 
    description: 'Authoritative yet accessible for tutorials.', 
    gender: 'male',
    instruction: 'Act as an expert tutorial lead. Your voice should be slow, clear, and exceptionally confident. Use a grounded tone that reassures the student they are learning from a master of the craft.'
  },
  { 
    id: 'Charon', 
    label: 'Crime Storyteller',
    name: 'Terror Narrator', 
    description: 'Very low, dark, and terrifying. Cold and unsettling.', 
    gender: 'male',
    instruction: 'Act as a suspense narrator in a horror documentary. Your voice must be very low, dark, and terrifying. Speak with a cold, threatening, and unsettling texture. Use long, heavy pauses and audible, shallow breaths. Every sentence should feel like a sinister warning. Avoid all warmth or friendliness; your voice should sound like a shadow in a dark room.'
  },
];

export const Icons = {
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  ),
  Stop: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>
  ),
  Download: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3" />
    </svg>
  ),
  Trash: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Wave: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 12c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1H5c-.55 0-1-.45-1-1zm6-6c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1zm0 12c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1zm6-6c0-.55.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1z"/>
    </svg>
  ),
  Mic: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  ),
  Speaker: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
  ),
};
