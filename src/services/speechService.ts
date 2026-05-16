type VoiceGender = 'male' | 'female';
type SpeechLanguage = 'en' | 'ta';

export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private speechRecognition: any;
  private isSynthesisSupported: boolean;
  private isRecognitionSupported: boolean;
  private preferredVoiceGender: VoiceGender;

  private maleVoiceHints = [
    'male',
    'man',
    'ravi',
    'david',
    'mark',
    'george',
    'daniel',
    'james',
    'alex',
    'fred',
    'tom',
    'thomas',
    'valluvar',
    'senthil'
  ];

  private femaleVoiceHints = [
    'female',
    'woman',
    'zira',
    'heera',
    'susan',
    'samantha',
    'victoria',
    'karen',
    'moira',
    'fiona',
    'veena',
    'monica',
    'pallavi',
    'kalpana',
    'kani',
    'latha',
    'asha',
    'swara',
    'vani',
    'lekha',
    'shruti',
    'neerja',
    'prabha'
  ];

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.speechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.isSynthesisSupported = !!this.speechSynthesis;
    this.isRecognitionSupported = !!this.speechRecognition;
    this.preferredVoiceGender = this.getStoredVoiceGender();
  }

  setPreferredVoiceFromEmail(email: string) {
    this.preferredVoiceGender = this.inferVoiceGenderFromEmail(email);
    this.saveVoiceGender();
  }

  setPreferredVoiceGender(gender: VoiceGender) {
    this.preferredVoiceGender = gender;
    this.saveVoiceGender();
  }

  private saveVoiceGender() {
    try {
      localStorage.setItem('tamil_ai_voice_gender', this.preferredVoiceGender);
    } catch {
      // Keep the in-memory preference if localStorage is unavailable.
    }
  }

  getPreferredVoiceGender(): VoiceGender {
    return this.preferredVoiceGender;
  }

  private getStoredVoiceGender(): VoiceGender {
    try {
      const storedGender = localStorage.getItem('tamil_ai_voice_gender');
      if (storedGender === 'male' || storedGender === 'female') {
        return storedGender;
      }

      const currentEmail = localStorage.getItem('tamil_ai_current_user');
      if (currentEmail) {
        return this.inferVoiceGenderFromEmail(currentEmail);
      }
    } catch {
      // Default below when localStorage cannot be read.
    }

    return 'female';
  }

  private inferVoiceGenderFromEmail(email: string): VoiceGender {
    const localPart = email.split('@')[0]?.toLowerCase() || '';
    const tokens = localPart.split(/[^a-z]+/).filter(Boolean);
    const compact = localPart.replace(/[^a-z]/g, '');

    const maleEmailHints = [
      'male',
      'boy',
      'man',
      'mr',
      'he',
      'him',
      'king',
      'bro',
      'anna',
      'arun',
      'mukesh',
      'raja',
      'kumar',
      'vijay',
      'ajay',
      'siva',
      'ram'
    ];
    const femaleEmailHints = [
      'female',
      'girl',
      'woman',
      'mrs',
      'ms',
      'she',
      'her',
      'queen',
      'akka',
      'priya',
      'divya',
      'kavya',
      'meena',
      'lakshmi',
      'sri',
      'anu',
      'nisha'
    ];

    if (femaleEmailHints.some(hint => tokens.includes(hint) || compact.includes(hint))) {
      return 'female';
    }

    if (maleEmailHints.some(hint => tokens.includes(hint) || compact.includes(hint))) {
      return 'male';
    }

    return 'female';
  }

  private getGenderScore(voice: SpeechSynthesisVoice) {
    const name = voice.name.toLowerCase();
    const genderHints = this.preferredVoiceGender === 'male'
      ? this.maleVoiceHints
      : this.femaleVoiceHints;
    const oppositeHints = this.preferredVoiceGender === 'male'
      ? this.femaleVoiceHints
      : this.maleVoiceHints;

    if (genderHints.some(hint => name.includes(hint))) return 1;
    if (oppositeHints.some(hint => name.includes(hint))) return -1;
    return 0;
  }

  private getLanguageScore(voice: SpeechSynthesisVoice, language: SpeechLanguage) {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = 0;

    if (language === 'ta') {
      if (lang.startsWith('ta')) score += 80;
      if (name.includes('tamil')) score += 70;
      if (lang.includes('en-in')) score += 35;
      if (name.includes('india') || name.includes('indian')) score += 30;
    } else {
      if (lang.startsWith('en')) score += 70;
      if (lang.includes('en-in')) score += 20;
      if (lang.includes('en-us')) score += 15;
    }

    return score;
  }

  private isTamilCapableVoice(voice: SpeechSynthesisVoice) {
    return this.getLanguageScore(voice, 'ta') >= 30;
  }

  private getRankedVoice(voices: SpeechSynthesisVoice[], language: SpeechLanguage) {
    return voices
      .map(voice => ({ voice, score: this.getLanguageScore(voice, language) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0]?.voice;
  }

  private selectTamilVoice(voices: SpeechSynthesisVoice[]) {
    const matchingGenderVoices = voices.filter(voice => this.getGenderScore(voice) > 0);
    const unknownGenderVoices = voices.filter(voice => this.getGenderScore(voice) === 0);
    const nonOppositeGenderVoices = voices.filter(voice => this.getGenderScore(voice) >= 0);

    return this.getRankedVoice(
      matchingGenderVoices.filter(voice => this.isTamilCapableVoice(voice)),
      'ta'
    )
      || this.getRankedVoice(
        unknownGenderVoices.filter(voice => this.isTamilCapableVoice(voice)),
        'ta'
      )
      || this.getRankedVoice(
        nonOppositeGenderVoices.filter(voice => this.isTamilCapableVoice(voice)),
        'ta'
      )
      || this.getRankedVoice(
        voices.filter(voice => this.isTamilCapableVoice(voice)),
        'ta'
      );
  }

  private selectVoice(voices: SpeechSynthesisVoice[], language: SpeechLanguage): SpeechSynthesisVoice | undefined {
    if (language === 'ta') {
      return this.selectTamilVoice(voices);
    }

    const matchingGenderVoices = voices.filter(voice => this.getGenderScore(voice) > 0);
    const oppositeGenderVoices = voices.filter(voice => this.getGenderScore(voice) < 0);
    const unknownGenderVoices = voices.filter(voice => this.getGenderScore(voice) === 0);
    const voiceGroups = [
      matchingGenderVoices,
      unknownGenderVoices,
      voices.filter(voice => !oppositeGenderVoices.includes(voice)),
      voices
    ];

    for (const group of voiceGroups) {
      const rankedVoices = group
        .map(voice => ({ voice, score: this.getLanguageScore(voice, language) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

      if (rankedVoices[0]) {
        return rankedVoices[0].voice;
      }
    }

    const sameGenderFallback = matchingGenderVoices
      .map(voice => ({ voice, score: this.getLanguageScore(voice, 'en') }))
      .sort((a, b) => b.score - a.score);

    return sameGenderFallback[0]?.voice || matchingGenderVoices[0] || voices[0];
  }

  private normalizeSpeechText(text: string, language: SpeechLanguage) {
    if (language !== 'ta' || (!text.includes('à®') && !text.includes('à¯'))) {
      return text;
    }

    try {
      const bytes = Uint8Array.from(text, char => char.charCodeAt(0) & 0xff);
      const decoded = new TextDecoder('utf-8').decode(bytes);
      return /[\u0B80-\u0BFF]/.test(decoded) ? decoded : text;
    } catch {
      return text;
    }
  }

  // Text-to-Speech functionality
  speak(text: string, language: SpeechLanguage = 'en', rate: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSynthesisSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const speakWithVoices = () => {
        const utterance = new SpeechSynthesisUtterance(this.normalizeSpeechText(text, language));
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
        utterance.rate = language === 'ta' ? Math.min(rate, 0.9) : rate;
        utterance.pitch = this.preferredVoiceGender === 'male'
          ? 0.75
          : language === 'ta'
            ? 1.18
            : 1.2;
        utterance.volume = 1;

        const selectedVoice = this.selectVoice(this.speechSynthesis.getVoices(), language);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event);

        this.speechSynthesis.cancel();
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
      if (!this.isRecognitionSupported || !this.speechRecognition) {
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
    return this.isSynthesisSupported;
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
