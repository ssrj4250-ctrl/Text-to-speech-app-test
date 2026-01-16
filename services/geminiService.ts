
import { GoogleGenAI, Modality } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-preview-tts';

export async function generateSpeech(text: string, voiceName: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Convert the following text into natural, human-sounding speech.
Voice must be clear, neutral, calm, and friendly.
No background music or sound effects.
Speak at a normal speed with correct pauses.

Text to convert:
${text}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
}
