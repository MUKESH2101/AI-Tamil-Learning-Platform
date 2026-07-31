import React, { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { tamilPhrases } from '../data/phrases';
import { speechService } from '../services/speechService';

/**
 * Picks a phrase deterministically based on today's date, so every user
 * sees the same "word of the day" and it stays stable across reloads.
 */
const WordOfTheDay: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const phrase = useMemo(() => {
    const dayStamp = Number(new Date().toISOString().slice(0, 10).split('-').join(''));
    const index = dayStamp % tamilPhrases.length;
    return tamilPhrases[index];
  }, []);

  const handlePlay = async () => {
    try {
      setIsSpeaking(true);
      await speechService.speak(phrase.tamil, 'ta', 0.85);
    } catch (e) {
      // Non-fatal: speech synthesis may be unavailable in some browsers.
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl2 bg-ink-700 text-cream-100 p-6 sm:p-8 shadow-card">
      <div className="absolute inset-0 kolam-field text-marigold-400/[0.07] pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow mb-3">Word of the day</p>
          <p className="font-tamil text-4xl sm:text-5xl font-semibold mb-2">{phrase.tamil}</p>
          <p className="text-marigold-300 text-lg font-medium">{phrase.transliteration}</p>
          <p className="text-cream-300/80 mt-1">"{phrase.english}"</p>
          {phrase.culturalContext && (
            <p className="text-cream-300/60 text-sm mt-4 max-w-md leading-relaxed">
              {phrase.culturalContext}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          disabled={isSpeaking}
          aria-label="Listen to pronunciation"
          className="flex-shrink-0 w-12 h-12 rounded-full bg-marigold-400 text-ink-800 flex items-center justify-center hover:bg-marigold-300 transition-colors disabled:opacity-60"
        >
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default WordOfTheDay;
