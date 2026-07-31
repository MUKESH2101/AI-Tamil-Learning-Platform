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
      setScore(null);
      setTamilOutput('');
      setEnglishOutput('');

      const result = await speechService.startListening('en');

      const pronunciationScore = speechService.scorePronunciation(
        currentPhrase.transliteration,
        result
      );
      setScore(pronunciationScore);

      const detectedLang = await translationService.detectLanguage(result);
      if (detectedLang === 'en') {
        setEnglishOutput(result);
        const tamil = await translationService.translateToTamil(result);
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
      const textToSpeak = tamilOutput || currentPhrase.tamil || currentPhrase.transliteration;
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
    setScore(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-300';
    if (score >= 60) return 'text-marigold-700 bg-marigold-50 border-marigold-200 dark:bg-marigold-500/10 dark:border-marigold-500/30 dark:text-marigold-300';
    return 'text-vermillion-700 bg-vermillion-50 border-vermillion-200 dark:bg-vermillion-500/10 dark:border-vermillion-500/30 dark:text-vermillion-300';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 60) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-cream-200 dark:bg-ink-800 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <MicOff className="text-vermillion-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-2">Speech Not Supported</h2>
          <p className="text-ink-400 dark:text-cream-300/70">
            Your browser doesn't support speech recognition. Please try using Chrome or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-ink-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-4"
        >
          <p className="section-eyebrow mb-2 justify-center">Practice</p>
          <h1 className="text-3xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-2">Speech Practice</h1>
          <p className="text-ink-400 dark:text-cream-300/70">Practice your Tamil pronunciation with AI feedback</p>
        </motion.div>

        {/* Practice Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 mb-6"
        >
          <div className="text-center mb-8">
            <div className="chip bg-marigold-50 dark:bg-ink-600 text-marigold-700 dark:text-marigold-300 mb-4">
              {currentPhrase.difficulty} • {currentPhrase.category}
            </div>

            <h2 className="font-tamil text-4xl font-bold text-ink-700 dark:text-cream-100 mb-2">{currentPhrase.tamil}</h2>
            <p className="text-2xl text-ink-500 dark:text-cream-300/80 mb-2">{currentPhrase.transliteration}</p>
            <p className="text-xl text-ink-300 dark:text-cream-300/60 mb-6">"{currentPhrase.english}"</p>

            {currentPhrase.culturalContext && (
              <div className="bg-marigold-50 dark:bg-ink-600 border border-marigold-200 dark:border-ink-400 rounded-xl p-4 mb-6">
                <p className="text-marigold-800 dark:text-marigold-200 text-sm">
                  <strong>Cultural Context:</strong> {currentPhrase.culturalContext}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={playPronunciation}
              className="btn bg-teal-500 text-white px-6 py-3 hover:bg-teal-600"
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>

            <button
              onClick={startListening}
              disabled={isListening}
              className={`btn px-6 py-3 ${
                isListening
                  ? 'bg-vermillion-500 text-white cursor-not-allowed'
                  : 'bg-ink-700 dark:bg-marigold-400 text-white dark:text-ink-800 hover:bg-ink-600 dark:hover:bg-marigold-300'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isListening ? 'Listening...' : 'Practice'}</span>
            </button>

            <button
              onClick={nextPhrase}
              className="btn bg-marigold-500 text-ink-800 px-6 py-3 hover:bg-marigold-400"
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
                className="border-t border-ink-50 dark:border-ink-500 pt-6"
              >
                <h3 className="text-lg font-semibold text-ink-700 dark:text-cream-100 mb-4">Your Pronunciation (Detected):</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-cream-200 dark:bg-ink-600 rounded-xl p-4">
                    <span className="block text-ink-300 dark:text-cream-300/50 text-xs mb-1">Tamil</span>
                    <p className="text-xl font-bold text-vermillion-600 dark:text-vermillion-300 font-tamil break-words">{tamilOutput}</p>
                  </div>
                  <div className="bg-cream-200 dark:bg-ink-600 rounded-xl p-4">
                    <span className="block text-ink-300 dark:text-cream-300/50 text-xs mb-1">English</span>
                    <p className="text-xl font-bold text-teal-700 dark:text-teal-300 font-mono break-words">{englishOutput}</p>
                  </div>
                </div>
                {score !== null && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`border rounded-xl p-4 ${getScoreColor(score)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Pronunciation Score</p>
                        <p className="text-sm opacity-80">{getScoreMessage(score)}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div className="text-3xl font-display font-bold">{score}%</div>
                        {score >= 80 && <Award size={20} />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-4">Practice Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-teal-50 dark:bg-ink-600 rounded-xl p-4">
              <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">Pronunciation Guide</h4>
              <p className="text-teal-700 dark:text-cream-300/70 text-sm">
                Listen carefully to the audio first, then try to match the rhythm and tone.
                Tamil has unique sounds that may be different from English.
              </p>
            </div>
            <div className="bg-marigold-50 dark:bg-ink-600 rounded-xl p-4">
              <h4 className="font-semibold text-marigold-800 dark:text-marigold-300 mb-2">Practice Strategy</h4>
              <p className="text-marigold-700 dark:text-cream-300/70 text-sm">
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
