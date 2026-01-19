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
        // Get pronunciation if available
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
  <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Text-to-Speech</h1>
          <p className="text-gray-600">Convert text to natural-sounding Tamil and English speech</p>
        </motion.div>

        {/* Main Audio Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-white"
        >
          {/* Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter text to convert to speech:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Speech Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speed: {getRateLabel(rate)}
              </label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Audio Controls */}
            <div className="flex items-end space-x-2">
              <button
                onClick={playText}
                disabled={!text.trim() || isPlaying}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Volume2 size={20} />
                <span>{isPlaying ? 'Playing...' : 'Play'}</span>
              </button>
              
              {isPlaying && (
                <button
                  onClick={stopAudio}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <VolumeX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Additional Features */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={translateText}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Languages size={16} />
              <span>Translate</span>
            </button>
            
            <button
              onClick={() => setText('')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Translation:</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
              <p className="text-blue-800 text-lg">{translation}</p>
            </div>
            {pronunciation && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <span className="text-orange-700 font-semibold">Pronunciation: </span>
                <span className="text-orange-800 text-lg">{pronunciation}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Phrases */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Phrases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPhrases.map((phrase, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPhrase(phrase)}
                className="text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border border-gray-200 rounded-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium text-gray-800">{phrase.text}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                    {phrase.lang === 'ta' ? 'தமிழ்' : 'ENG'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{phrase.translation}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Audio Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Sliders className="mr-2" />
            Audio Features
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
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