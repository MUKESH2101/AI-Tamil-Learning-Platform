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

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'translation': return 'border-l-blue-500 bg-blue-50';
      case 'lesson': return 'border-l-green-500 bg-green-50';
      case 'correction': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  return (
  <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Tamil Learning Assistant</h2>
            <p className="text-sm text-gray-600">AI-powered language tutor</p>
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
                  className={`rounded-lg p-4 shadow-sm ${
                    message.isBot
                      ? `border-l-4 ${getMessageTypeColor(message.type)} text-gray-800 bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-100`
                      : 'bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot ? 'order-1 mr-3 bg-gradient-to-r from-pink-400 to-purple-400' : 'order-2 ml-3 bg-yellow-400'
              }`}>
                {message.isBot ? (
                  <Bot className="text-white" size={16} />
                ) : (
                  <User className="text-white" size={16} />
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters */}
      {messages.length === 1 && (
        <div className="p-4 bg-white border-t">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="text-yellow-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {conversationStarters.map((starter, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(starter)}
                className="text-xs px-3 py-2 bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 text-purple-700 rounded-full hover:scale-105 transition-colors shadow"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask me anything about Tamil..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white p-2 rounded-xl shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;