import { Question } from '../types';

export const tamilQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the Tamil word for "water"?',
    options: ['நீர்', 'உணவு', 'வீடு', 'பூ'],
    correctAnswer: 0,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: 'நீர் (Neer) is the Tamil word for water, essential for daily conversation.'
  },
  {
    id: '2',
    question: 'Which is the correct way to say "Good evening" in Tamil?',
    options: ['காலை வணக்கம்', 'மாலை வணக்கம்', 'இரவு வணக்கம்', 'மதியம் வணக்கம்'],
    correctAnswer: 1,
    category: 'greetings',
    difficulty: 'beginner',
    explanation: 'மாலை வணக்கம் (Maalai vanakkam) is the proper evening greeting.'
  },
  {
    id: '3',
    question: 'What does "நன்றி" mean in English?',
    options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
    correctAnswer: 2,
    category: 'courtesy',
    difficulty: 'beginner',
    explanation: 'நன்றி (Nandri) means "Thank you" and is fundamental to Tamil etiquette.'
  },
  {
    id: '4',
    question: 'Which Tamil letter represents the sound "ka"?',
    options: ['க', 'ச', 'த', 'ப'],
    correctAnswer: 0,
    category: 'alphabet',
    difficulty: 'intermediate',
    explanation: 'க represents the "ka" sound and is one of the basic consonants in Tamil script.'
  },
  {
    id: '5',
    question: 'How do you say "I am learning Tamil" in Tamil?',
    options: ['நான் தமிழ் படிக்கிறேன்', 'நான் தமிழ் பேசுகிறேன்', 'நான் தமிழ் எழுதுகிறேன்', 'நான் தமிழ் கேட்கிறேன்'],
    correctAnswer: 0,
    category: 'sentences',
    difficulty: 'intermediate',
    explanation: 'நான் தமிழ் படிக்கிறேன் (Naan tamil padikkireen) means "I am learning Tamil".'
  }
];