import React from 'react';

const Games: React.FC = () => {
  return (
  <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-4 text-center drop-shadow-lg">Tamil Knowledge Games</h1>
  <p className="mb-8 text-center text-lg text-gray-700 font-medium">Play games to improve your Tamil vocabulary, grammar, and comprehension skills!</p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tamil Quiz Game */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-purple-200 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Quiz Game</h2>
          <p className="mb-4 text-center">Test your Tamil knowledge with fun multiple-choice questions. Improve your vocabulary, grammar, and comprehension by playing quizzes!</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Start Quiz (Coming Soon)</button>
        </div>

        {/* Tamil Word Search Game (like Jalebi) */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-purple-200 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Word Search</h2>
          <p className="mb-4 text-center">Find hidden Tamil words in a grid, just like the Jalebi game! Sharpen your observation and spelling skills while having fun.</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Play Word Search (Coming Soon)</button>
        </div>

        {/* Tamil Typing Game */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Typing Game</h2>
          <p className="mb-4 text-center">Practice typing Tamil words and sentences quickly and accurately. Great for improving your Tamil keyboard skills!</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Start Typing (Coming Soon)</button>
        </div>

        {/* Tamil Sentence Builder Game */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Sentence Builder</h2>
          <p className="mb-4 text-center">Arrange words to form correct Tamil sentences. Learn grammar and sentence structure by playing!</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Build Sentences (Coming Soon)</button>
        </div>

        {/* Tamil Listening Game */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Listening Game</h2>
          <p className="mb-4 text-center">Listen to Tamil audio and choose the correct meaning or word. Improve your listening and comprehension skills!</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Start Listening (Coming Soon)</button>
        </div>

        {/* Tamil Pronunciation Game */}
  <div className="bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-2xl p-6 flex flex-col items-center shadow-xl border transition-transform duration-200 hover:scale-105 hover:cursor-pointer">
  <h2 className="text-2xl font-bold mb-2 text-blue-800">Pronunciation Game</h2>
          <p className="mb-4 text-center">Practice pronouncing Tamil words and get instant feedback. Perfect your Tamil accent and speaking skills!</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md" disabled>Practice Pronunciation (Coming Soon)</button>
        </div>
      </div>

  <div className="mt-10 text-gray-500 text-center text-lg font-semibold">More interactive games and real-time Tamil learning activities coming soon!</div>
    </div>
  );
};

export default Games;
