import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatbotService } from '../services/chatbotService';
import { Send, Bot, User, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'வணக்கம்! Hello! I\'m your Tamil learning assistant. I can help you with translations, teach you phrases, give you quizzes, and answer questions about Tamil culture. What would you like to learn today?',
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationStarters = chatbotService.getConversationStarters();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.processMessage(inputText);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      toast.error('Sorry, I encountered an error. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = (starter: string) => {
    setInputText(starter);
  };

  const getMessageTypeAccent = (type?: string) => {
    switch (type) {
      case 'translation': return 'border-l-teal-500';
      case 'lesson': return 'border-l-marigold-500';
      case 'correction': return 'border-l-vermillion-500';
      default: return 'border-l-ink-100 dark:border-l-ink-400';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-cream-200 dark:bg-ink-800">
      {/* Chat Header */}
      <div className="bg-white dark:bg-ink-700 shadow-soft border-b border-ink-50 dark:border-ink-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink-700 dark:bg-marigold-400 rounded-full flex items-center justify-center">
            <Bot className="text-marigold-300 dark:text-ink-800" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-ink-700 dark:text-cream-100">Tamil Learning Assistant</h2>
            <p className="text-sm text-ink-400 dark:text-cream-300/70">AI-powered language tutor</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.isBot ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl p-4 shadow-soft ${
                    message.isBot
                      ? `border-l-4 ${getMessageTypeAccent(message.type)} bg-white dark:bg-ink-600 text-ink-700 dark:text-cream-100`
                      : 'bg-vermillion-500 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-tamil">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.isBot ? 'text-ink-300 dark:text-cream-300/50' : 'text-vermillion-100'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot ? 'order-1 mr-3 bg-ink-700 dark:bg-marigold-400' : 'order-2 ml-3 bg-marigold-400'
              }`}>
                {message.isBot ? (
                  <Bot className="text-marigold-300 dark:text-ink-800" size={16} />
                ) : (
                  <User className="text-ink-800" size={16} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-ink-700 dark:bg-marigold-400 rounded-full flex items-center justify-center">
                <Bot className="text-marigold-300 dark:text-ink-800" size={16} />
              </div>
              <div className="bg-white dark:bg-ink-600 rounded-2xl p-4 shadow-soft">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-ink-300 dark:bg-cream-300/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-ink-300 dark:bg-cream-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-ink-300 dark:bg-cream-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters */}
      {messages.length === 1 && (
        <div className="p-4 bg-white dark:bg-ink-700 border-t border-ink-50 dark:border-ink-500">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="text-marigold-500" size={16} />
            <span className="text-sm font-medium text-ink-600 dark:text-cream-200">Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {conversationStarters.map((starter, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(starter)}
                className="text-xs px-3 py-2 bg-marigold-50 dark:bg-ink-600 text-vermillion-700 dark:text-marigold-300 rounded-full hover:bg-marigold-100 dark:hover:bg-ink-500 transition-colors font-medium"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white dark:bg-ink-700 border-t border-ink-50 dark:border-ink-500">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask me anything about Tamil..."
            className="field flex-1"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-vermillion-500 text-white p-3 rounded-full shadow-soft hover:bg-vermillion-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
