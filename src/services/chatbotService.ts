import { ChatMessage } from '../types';
import { tamilPhrases } from '../data/phrases';
import { tamilQuestions } from '../data/questions';
import { translationService } from './translationService';

export class ChatbotService {
  private responses: Record<string, string[]> = {
    greeting: [
      "வணக்கம்! Welcome to your Tamil learning journey!",
      "Hello! I'm here to help you learn Tamil. How can I assist you today?",
      "நமஸ்காரம்! Ready to explore the beautiful Tamil language?"
    ],
    help: [
      "I can help you with translations, pronunciations, grammar, and cultural context!",
      "Ask me about Tamil phrases, take quizzes, or practice conversations!",
      "Try asking: 'How do you say hello in Tamil?' or 'Give me a Tamil phrase'"
    ],
    translation: [
      "Let me translate that for you!",
      "Here's the translation you requested:",
      "Great question! Here's how you say that in Tamil:"
    ],
    phrase: [
      "Here's a useful Tamil phrase for you:",
      "Let me teach you a new phrase:",
      "This phrase will be helpful in conversations:"
    ],
    quiz: [
      "Ready for a challenge? Here's a question for you:",
      "Let's test your Tamil knowledge:",
      "Time for a quick quiz!"
    ],
    encouragement: [
      "Great job! You're making excellent progress!",
      "நன்றாக இருக்கிறது! (That's great!) Keep it up!",
      "Wonderful! Your Tamil skills are improving!"
    ]
  };

  private conversationContext: string[] = [];

  async processMessage(message: string): Promise<ChatMessage> {
    const lowerMessage = message.toLowerCase().trim();
    this.conversationContext.push(lowerMessage);

    // Keep only last 5 messages for context
    if (this.conversationContext.length > 5) {
      this.conversationContext.shift();
    }

    let response = await this.generateResponse(lowerMessage);
    
    return {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
      type: this.getResponseType(lowerMessage)
    };
  }

  private async generateResponse(message: string): Promise<string> {
    // Greeting responses
    if (this.isGreeting(message)) {
      return this.getRandomResponse('greeting');
    }

    // Help requests
    if (this.isHelpRequest(message)) {
      return this.getRandomResponse('help');
    }

    // Translation requests
    if (this.isTranslationRequest(message)) {
      return await this.handleTranslation(message);
    }

    // Phrase requests
    if (this.isPhraseRequest(message)) {
      return this.handlePhraseRequest();
    }

    // Quiz requests
    if (this.isQuizRequest(message)) {
      return this.handleQuizRequest();
    }

    // Grammar questions
    if (this.isGrammarQuestion(message)) {
      return this.handleGrammarQuestion(message);
    }

    // Cultural questions
    if (this.isCulturalQuestion(message)) {
      return this.handleCulturalQuestion(message);
    }

    // Default response with helpful suggestions
    return this.getDefaultResponse();
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'வணக்கம்', 'vanakkam', 'hey', 'good morning', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private isHelpRequest(message: string): boolean {
    const helpKeywords = ['help', 'assist', 'what can you do', 'how do you work'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  private isTranslationRequest(message: string): boolean {
    const translationKeywords = ['translate', 'how do you say', 'what does', 'mean', 'translation'];
    return translationKeywords.some(keyword => message.includes(keyword));
  }

  private isPhraseRequest(message: string): boolean {
    const phraseKeywords = ['phrase', 'teach me', 'learn', 'show me'];
    return phraseKeywords.some(keyword => message.includes(keyword));
  }

  private isQuizRequest(message: string): boolean {
    const quizKeywords = ['quiz', 'test', 'question', 'challenge'];
    return quizKeywords.some(keyword => message.includes(keyword));
  }

  private isGrammarQuestion(message: string): boolean {
    const grammarKeywords = ['grammar', 'conjugate', 'tense', 'verb', 'noun', 'adjective'];
    return grammarKeywords.some(keyword => message.includes(keyword));
  }

  private isCulturalQuestion(message: string): boolean {
    const culturalKeywords = ['culture', 'tradition', 'custom', 'festival', 'food', 'history'];
    return culturalKeywords.some(keyword => message.includes(keyword));
  }

  private async handleTranslation(message: string): Promise<string> {
    // Extract the word/phrase to translate
    const translateMatch = message.match(/"([^"]+)"|'([^']+)'|\b([\w\s]+)\b$/);
    if (translateMatch) {
      const textToTranslate = translateMatch[1] || translateMatch[2] || translateMatch[3];
      
      try {
        const language = await translationService.detectLanguage(textToTranslate);
        let translation;
        
        if (language === 'en') {
          translation = await translationService.translateToTamil(textToTranslate);
        } else {
          translation = await translationService.translateToEnglish(textToTranslate);
        }
        
        return `${this.getRandomResponse('translation')}\n\n"${textToTranslate}" = "${translation}"`;
      } catch (error) {
        return "I'm having trouble with that translation. Could you try rephrasing your request?";
      }
    }
    
    return "Could you specify what you'd like me to translate? Try: 'How do you say \"hello\" in Tamil?'";
  }

  private handlePhraseRequest(): string {
    const randomPhrase = tamilPhrases[Math.floor(Math.random() * tamilPhrases.length)];
    return `${this.getRandomResponse('phrase')}\n\n**English:** ${randomPhrase.english}\n**Tamil:** ${randomPhrase.tamil}\n**Pronunciation:** ${randomPhrase.transliteration}\n\n${randomPhrase.culturalContext ? `**Cultural Context:** ${randomPhrase.culturalContext}` : ''}`;
  }

  private handleQuizRequest(): string {
    const randomQuestion = tamilQuestions[Math.floor(Math.random() * tamilQuestions.length)];
    const options = randomQuestion.options.map((option, index) => 
      `${String.fromCharCode(65 + index)}. ${option}`
    ).join('\n');
    
    return `${this.getRandomResponse('quiz')}\n\n**${randomQuestion.question}**\n\n${options}\n\nWhat's your answer?`;
  }

  private handleGrammarQuestion(message: string): string {
    const grammarTips = [
      "Tamil verbs change based on tense, person, and number. For example: 'படி' (padi) becomes 'படிக்கிறேன்' (padikkireen) for 'I read'.",
      "Tamil has different levels of formality. Use 'நீங்கள்' (neengal) for formal 'you' and 'நீ' (nee) for informal.",
      "Word order in Tamil is typically Subject-Object-Verb (SOV), unlike English which is Subject-Verb-Object.",
      "Tamil has agglutination - words are formed by adding suffixes to root words."
    ];
    
    return grammarTips[Math.floor(Math.random() * grammarTips.length)];
  }

  private handleCulturalQuestion(message: string): string {
    const culturalInfo = [
      "Tamil culture values respect for elders. Always use formal language when speaking to older people.",
      "Pongal is one of the most important Tamil festivals, celebrating the harvest season.",
      "Tamil literature is over 2000 years old, with works like Thirukkural being philosophical masterpieces.",
      "Traditional Tamil food includes rice, sambar, rasam, and various vegetarian dishes."
    ];
    
    return culturalInfo[Math.floor(Math.random() * culturalInfo.length)];
  }

  private getDefaultResponse(): string {
    const defaultResponses = [
      "I'm here to help you learn Tamil! Try asking me to translate something or teach you a new phrase.",
      "Great question! I can help with translations, phrases, quizzes, and cultural information about Tamil.",
      "Let's continue your Tamil learning journey! Ask me about grammar, vocabulary, or Tamil culture."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  private getRandomResponse(category: string): string {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getResponseType(message: string): 'text' | 'translation' | 'correction' | 'lesson' {
    if (this.isTranslationRequest(message)) return 'translation';
    if (this.isPhraseRequest(message) || this.isGrammarQuestion(message)) return 'lesson';
    return 'text';
  }

  // Get pre-loaded questions for different categories
  getQuestionsByCategory(category: string): typeof tamilQuestions {
    return tamilQuestions.filter(q => q.category === category);
  }

  // Get conversation starters
  getConversationStarters(): string[] {
    return [
      "What's a common Tamil greeting?",
      "How do you say 'thank you' in Tamil?",
      "Teach me a useful Tamil phrase",
      "Give me a Tamil quiz question",
      "Tell me about Tamil culture"
    ];
  }
}

export const chatbotService = new ChatbotService();