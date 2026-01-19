import React, { useState, useEffect } from 'react';
import { translationService } from '../services/translationService';
import { speechService } from '../services/speechService';
import { tamilPhrases } from '../data/phrases';
import { Mic, MicOff, Volume2, Award, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Speech: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(tamilPhrases[0]);
  const [score, setScore] = useState<number | null>(null);
  const [tamilOutput, setTamilOutput] = useState('');
  const [englishOutput, setEnglishOutput] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(speechService.isSpeechSupported());
    if (!speechService.isSpeechSupported()) {
      toast.error('Speech recognition is not supported in your browser');
    }
  }, []);

  const startListening = async () => {
    if (!isSupported) return;
    try {
      setIsListening(true);
  // transcript removed
      setScore(null);
      setTamilOutput('');
      setEnglishOutput('');

      const result = await speechService.startListening('en');
  // transcript removed

      // Score pronunciation
      const pronunciationScore = speechService.scorePronunciation(
        currentPhrase.transliteration,
        result
      );
      setScore(pronunciationScore);

      // Show both Tamil and English output
      const detectedLang = await translationService.detectLanguage(result);
      if (detectedLang === 'en') {
        setEnglishOutput(result);
        const tamil = await translationService.translateToTamil(result);
        // If translation not found, transliterate to Tamil script
        if (tamil.startsWith('[Translation')) {
          setTamilOutput('மொழிபெயர்ப்பு கிடைக்கவில்லை');
        } else {
          setTamilOutput(tamil);
        }
      } else {
        setTamilOutput(result);
        const english = await translationService.translateToEnglish(result);
        setEnglishOutput(english);
      }

      if (pronunciationScore >= 80) {
        toast.success('Excellent pronunciation! 🎉');
      } else if (pronunciationScore >= 60) {
        toast.success('Good effort! Keep practicing 👍');
      } else {
        toast('Try again - focus on the pronunciation guide', { icon: '💪' });
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Could not recognize speech. Please try again.');
    } finally {
      setIsListening(false);
    }
  };

  const playPronunciation = async () => {
    try {
      const textToSpeak = tamilOutput || currentPhrase.transliteration;
      // Check if a Tamil voice is available
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ta'));
      if (!tamilVoice) {
        toast.error('Tamil text-to-speech is not supported in your browser.');
        return;
      }
      await speechService.speak(textToSpeak, 'ta', 0.8);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Could not play pronunciation');
    }
  };

  const nextPhrase = () => {
    const currentIndex = tamilPhrases.findIndex(p => p.id === currentPhrase.id);
    const nextIndex = (currentIndex + 1) % tamilPhrases.length;
    setCurrentPhrase(tamilPhrases[nextIndex]);
  // transcript removed
    setScore(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 60) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <MicOff className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Speech Not Supported</h2>
          <p className="text-gray-600">
            Your browser doesn't support speech recognition. Please try using Chrome or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Speech Practice</h1>
          <p className="text-gray-600">Practice your Tamil pronunciation with AI feedback</p>
        </motion.div>

        {/* Practice Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              {currentPhrase.difficulty} • {currentPhrase.category}
            </div>
            
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentPhrase.tamil}</h2>
            <p className="text-2xl text-gray-600 mb-2">{currentPhrase.transliteration}</p>
            <p className="text-xl text-gray-500 mb-6">"{currentPhrase.english}"</p>
            
            {currentPhrase.culturalContext && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-sm">
                  <strong>Cultural Context:</strong> {currentPhrase.culturalContext}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={playPronunciation}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>
            
            <button
              onClick={startListening}
              disabled={isListening}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isListening ? 'Listening...' : 'Practice'}</span>
            </button>
            
            <button
              onClick={nextPhrase}
              className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <RotateCcw size={20} />
              <span>Next</span>
            </button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {(tamilOutput || englishOutput) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border-t pt-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Pronunciation (Detected):</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="block text-gray-500 text-xs mb-1">Tamil</span>
                    <p className="text-xl font-bold text-purple-700 font-mono break-words">{tamilOutput}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="block text-gray-500 text-xs mb-1">English</span>
                    <p className="text-xl font-bold text-blue-700 font-mono break-words">{englishOutput}</p>
                  </div>
                </div>
                {score !== null && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`border rounded-lg p-4 ${getScoreColor(score)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Pronunciation Score</p>
                        <p className="text-sm opacity-80">{getScoreMessage(score)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{score}%</div>
                        {score >= 80 && <Award className="inline-block ml-2" size={20} />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Practice Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Pronunciation Guide</h4>
              <p className="text-blue-700 text-sm">
                Listen carefully to the audio first, then try to match the rhythm and tone. 
                Tamil has unique sounds that may be different from English.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Practice Strategy</h4>
              <p className="text-green-700 text-sm">
                Break down complex phrases into smaller parts. Practice each syllable 
                slowly before putting them together.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Speech;