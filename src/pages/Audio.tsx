import React, { useState } from 'react';
import { speechService } from '../services/speechService';
import { translationService } from '../services/translationService';
import { Volume2, VolumeX, Type, Languages, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Audio: React.FC = () => {
  const [text, setText] = useState('வணக்கம்! Welcome to Tamil learning!');
  const [language, setLanguage] = useState<'en' | 'ta'>('ta');
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [translation, setTranslation] = useState('');
  const [pronunciation, setPronunciation] = useState('');

  const quickPhrases = [
    { text: 'வணக்கம்', translation: 'Hello', lang: 'ta' as const },
    { text: 'நன்றி', translation: 'Thank you', lang: 'ta' as const },
    { text: 'மன்னிக்கவும்', translation: 'Sorry', lang: 'ta' as const },
    { text: 'எப்படி இருக்கிறீர்கள்?', translation: 'How are you?', lang: 'ta' as const },
    { text: 'நீங்கள் எங்கே இருக்கிறீர்கள்?', translation: 'Where are you?', lang: 'ta' as const },
    { text: 'உங்கள் பெயர் என்ன?', translation: 'What is your name?', lang: 'ta' as const },
    { text: 'நான் தமிழில் பேச விரும்புகிறேன்', translation: 'I want to speak in Tamil', lang: 'ta' as const },
    { text: 'Good morning', translation: 'காலை வணக்கம்', lang: 'en' as const },
    { text: 'Good night', translation: 'இனிய இரவு', lang: 'en' as const },
    { text: 'See you soon', translation: 'உங்களை விரைவில் பார்க்கிறேன்', lang: 'en' as const },
    { text: 'Thank you very much', translation: 'மிக்க நன்றி', lang: 'en' as const },
    { text: 'How are you?', translation: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', lang: 'en' as const },
    { text: 'Please help me', translation: 'தயவு செய்து எனக்கு உதவுங்கள்', lang: 'en' as const }
  ];

  const playText = async () => {
    if (!text.trim()) return;

    try {
      setIsPlaying(true);
      await speechService.speak(text, language, rate);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Could not play audio. Please check your browser settings.');
    } finally {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleQuickPhrase = (phrase: typeof quickPhrases[0]) => {
    setText(phrase.text);
    setLanguage(phrase.lang);
    setTranslation(phrase.translation);
  };

  const translateText = async () => {
    if (!text.trim()) return;
    setPronunciation('');
    try {
      const detectedLang = await translationService.detectLanguage(text);
      let result;
      if (detectedLang === 'en') {
        result = await translationService.translateToTamil(text);
        setTranslation(result);
        const rules = translationService.getTransliterationRules();
        setPronunciation(rules[result] || '');
      } else {
        result = await translationService.translateToEnglish(text);
        setTranslation(result);
      }
      toast.success('Translation completed!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    }
  };

  const getRateLabel = (rate: number) => {
    if (rate <= 0.5) return 'Very Slow';
    if (rate <= 0.75) return 'Slow';
    if (rate <= 1) return 'Normal';
    if (rate <= 1.25) return 'Fast';
    return 'Very Fast';
  };

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-ink-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-4"
        >
          <p className="section-eyebrow mb-2 justify-center">Listen &amp; speak</p>
          <h1 className="text-3xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-2">Text-to-Speech</h1>
          <p className="text-ink-400 dark:text-cream-300/70">Convert text to natural-sounding Tamil and English speech</p>
        </motion.div>

        {/* Main Audio Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-xl2 bg-ink-700 text-cream-100 shadow-card p-8 mb-6"
        >
          <div className="absolute inset-0 kolam-field text-marigold-400/[0.06] pointer-events-none" />
          {/* Text Input */}
          <div className="relative mb-6">
            <label className="block text-sm font-semibold text-cream-200 mb-2">
              Enter text to convert to speech:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-marigold-400 text-lg bg-white/95 text-ink-700 font-tamil"
            />
          </div>

          {/* Controls */}
          <div className="relative grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-cream-200 mb-2">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
                className="w-full rounded-xl px-4 py-2.5 bg-white/95 text-ink-700 focus:outline-none focus:ring-2 focus:ring-marigold-400"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-200 mb-2">
                Speed: {getRateLabel(rate)}
              </label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-marigold-400 mt-3.5"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={playText}
                disabled={!text.trim() || isPlaying}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-colors font-semibold ${
                  isPlaying
                    ? 'bg-white/20 text-cream-300 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-400 text-white'
                }`}
              >
                <Volume2 size={20} />
                <span>{isPlaying ? 'Playing...' : 'Play'}</span>
              </button>

              {isPlaying && (
                <button
                  onClick={stopAudio}
                  className="px-4 py-2.5 bg-vermillion-500 text-white rounded-xl hover:bg-vermillion-600 transition-colors"
                >
                  <VolumeX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Additional Features */}
          <div className="relative flex flex-wrap gap-2">
            <button
              onClick={translateText}
              className="flex items-center gap-2 px-4 py-2 bg-marigold-400 text-ink-800 font-semibold rounded-xl hover:bg-marigold-300 transition-colors"
            >
              <Languages size={16} />
              <span>Translate</span>
            </button>

            <button
              onClick={() => setText('')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-cream-100 font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              <Type size={16} />
              <span>Clear</span>
            </button>
          </div>
        </motion.div>

        {/* Translation Result */}
        {translation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-ink-700 dark:text-cream-100 mb-3">Translation:</h3>
            <div className="bg-teal-50 dark:bg-ink-600 border border-teal-200 dark:border-ink-400 rounded-xl p-4 mb-2">
              <p className="text-teal-800 dark:text-teal-200 text-lg font-tamil">{translation}</p>
            </div>
            {pronunciation && (
              <div className="bg-marigold-50 dark:bg-ink-600 border border-marigold-200 dark:border-ink-400 rounded-xl p-4">
                <span className="text-marigold-700 dark:text-marigold-300 font-semibold">Pronunciation: </span>
                <span className="text-marigold-800 dark:text-marigold-200 text-lg">{pronunciation}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Phrases */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-4">Quick Phrases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPhrases.map((phrase, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPhrase(phrase)}
                className="text-left p-4 bg-cream-200 dark:bg-ink-600 hover:bg-marigold-50 dark:hover:bg-ink-500 border border-ink-50 dark:border-ink-400 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-ink-700 dark:text-cream-100 font-tamil">{phrase.text}</span>
                  <span className="text-xs px-2 py-1 bg-vermillion-100 dark:bg-vermillion-500/20 text-vermillion-700 dark:text-vermillion-300 rounded-full font-semibold">
                    {phrase.lang === 'ta' ? 'தமிழ்' : 'ENG'}
                  </span>
                </div>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">{phrase.translation}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Audio Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden mt-6 bg-gradient-to-br from-vermillion-500 to-vermillion-600 text-white rounded-xl2 shadow-card p-6"
        >
          <div className="absolute inset-0 kolam-field text-white/[0.08] pointer-events-none" />
          <h3 className="relative text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Sliders size={20} />
            Audio Features
          </h3>
          <div className="relative grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Multiple Dialects</h4>
              <p className="opacity-90">
                Supports various Tamil dialects and proper English pronunciation
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Speed Control</h4>
              <p className="opacity-90">
                Adjust speech rate from 0.25x to 2x for better learning
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">High Quality</h4>
              <p className="opacity-90">
                Uses advanced text-to-speech for natural pronunciation
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Audio;
