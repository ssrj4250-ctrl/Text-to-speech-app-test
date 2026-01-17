
import { GoogleGenAI, Modality } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-preview-tts';

export async function generateSpeech(
  text: string, 
  voiceName: string, 
  personaInstruction: string,
  speed: number = 1.0,
  pitch: string = "normal"
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Task: High-Fidelity Human-Like Speech Synthesis.

Voice Acting Persona:
${personaInstruction}

Audio Parameters:
- Delivery Speed: ${speed}x (relative to a natural baseline)
- Vocal Pitch: ${pitch}

CRITICAL INSTRUCTIONS FOR NATURALNESS:
1. BREATHING: Incorporate subtle, natural breath patterns between sentences and long phrases, just as a human speaker would.
2. PROSODY: Avoid any robotic or synthesized rhythm. Use natural pitch variation and volume shifts to emphasize key words based on the context of the text.
3. ARTICULATION: Ensure smooth, fluid transitions between words. Do not clip consonants too harshly.
4. EMOTIONAL INTELLIGENCE: Infuse the voice with the subtle emotional subtext implied by the text (e.g., a slight smile in the voice for friendly content, or a serious weight for warnings).
5. PUNCTUATION: Carefully interpret punctuation for timing. A comma is a brief lift, a period is a definitive breath and drop, and an ellipsis is a contemplative pause.
6. NO ROBOTIC ARTIFACTS: Every word must sound like it is being spoken by a professional voice actor in a studio environment.

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
