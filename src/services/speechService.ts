export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private speechRecognition: any;
  private isSupported: boolean;

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.speechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isSupported = !!this.speechSynthesis && !!this.speechRecognition;
  }

  // Text-to-Speech functionality
  speak(text: string, language: 'en' | 'ta' = 'en', rate: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const speakWithVoices = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to select a Tamil voice if available
        if (language === 'ta') {
          const voices = this.speechSynthesis.getVoices();
          const tamilVoice = voices.find(v => v.lang.toLowerCase().startsWith('ta'));
          if (tamilVoice) {
            utterance.voice = tamilVoice;
          }
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event);

        this.speechSynthesis.speak(utterance);
      };

      // If voices are not loaded yet, wait for them
      if (this.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithVoices();
        };
        // Also try to trigger loading
        window.speechSynthesis.getVoices();
      } else {
        speakWithVoices();
      }
    });
  }

  // Speech-to-Text functionality
  startListening(language: 'en' | 'ta' = 'en'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.speechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const recognition = new this.speechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // Recognition ended
      };

      recognition.start();
    });
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis.getVoices();
  }

  // Check if speech features are supported
  isSpeechSupported(): boolean {
    return this.isSupported;
  }

  // Pronunciation scoring (simplified implementation)
  scorePronunciation(target: string, spoken: string): number {
    const similarity = this.calculateSimilarity(target.toLowerCase(), spoken.toLowerCase());
    return Math.round(similarity * 100);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
  }
}

export const speechService = new SpeechService();