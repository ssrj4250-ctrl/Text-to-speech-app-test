
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Encodes an AudioBuffer to a compressed MP3 Blob using lamejs.
 * Requires lamejs to be available on the window object.
 */
export function bufferToMp3Blob(buffer: AudioBuffer): Blob {
  const lame = (window as any).lamejs;
  if (!lame) {
    throw new Error("MP3 Encoder (lamejs) not loaded. Please check your internet connection.");
  }

  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const kbps = 128; // Standard professional bitrate
  const mp3encoder = new lame.Mp3Encoder(channels, sampleRate, kbps);
  
  const mp3Data: Uint8Array[] = [];
  
  // We handle Mono (Kore/Puck etc are mono from Gemini) or Stereo
  if (channels === 1) {
    const samples = buffer.getChannelData(0);
    const samplesInt16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      // Scale to 16-bit signed integer
      samplesInt16[i] = samples[i] < 0 ? samples[i] * 0x8000 : samples[i] * 0x7FFF;
    }

    const sampleBlockSize = 1152; // Lame standard block size
    for (let i = 0; i < samplesInt16.length; i += sampleBlockSize) {
      const sampleChunk = samplesInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
  } else {
    // Basic support for Stereo if ever used
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const leftInt16 = new Int16Array(left.length);
    const rightInt16 = new Int16Array(right.length);
    for (let i = 0; i < left.length; i++) {
      leftInt16[i] = left[i] < 0 ? left[i] * 0x8000 : left[i] * 0x7FFF;
      rightInt16[i] = right[i] < 0 ? right[i] * 0x8000 : right[i] * 0x7FFF;
    }

    const sampleBlockSize = 1152;
    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(new Uint8Array(mp3buf));
  }

  return new Blob(mp3Data, { type: 'audio/mpeg' });
}
