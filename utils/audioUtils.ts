export const AudioUtils = {
  // Convert Float32Array (Web Audio API) to Int16Array (PCM for Gemini)
  float32ToInt16: (float32: Float32Array): Int16Array => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  },

  // Convert Int16Array (PCM from Gemini) to Float32Array (Web Audio API)
  int16ToFloat32: (int16: Int16Array): Float32Array => {
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      const s = int16[i];
      float32[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
    }
    return float32;
  },

  // Convert raw bytes to base64
  arrayBufferToBase64: (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  // Convert base64 to raw bytes
  base64ToArrayBuffer: (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
  
  // Resample audio if sample rates differ (Simple linear interpolation)
  resample: (source: Float32Array, targetRate: number, sourceRate: number): Float32Array => {
    if (sourceRate === targetRate) return source;
    const ratio = sourceRate / targetRate;
    const newLength = Math.round(source.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;
      if (index + 1 < source.length) {
        result[i] = source[index] * (1 - fraction) + source[index + 1] * fraction;
      } else {
        result[i] = source[index];
      }
    }
    return result;
  }
};