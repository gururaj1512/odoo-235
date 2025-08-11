import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';

const GEMINI_API_KEY = 'AIzaSyAerBoGRKAl_AMK4uGDG1re1u86sNxa28o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const VOICE_LANG_CODES = {
  english: 'en-US',
  hindi: 'hi-IN',
  marathi: 'mr-IN',
  gujarati: 'gu-IN'
};

const VOICE_NAMES = {
  english: 'en-US-Wavenet-D',
  hindi: 'hi-IN-Wavenet-A',
  marathi: 'mr-IN-Wavenet-A',
  gujarati: 'gu-IN-Wavenet-A'
};

const STT_LANG_CODES = {
  english: 'en-US',
  hindi: 'hi-IN',
  marathi: 'mr-IN',
  gujarati: 'gu-IN'
};

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        alert('Speech recognition error: ' + event.error);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const getGeminiReply = async (text: string) => {
    const sportsPrompt = `You are a knowledgeable sports specialist and expert commentator with deep knowledge of all sports including cricket, football, basketball, tennis, badminton, hockey, swimming, athletics, and more. You provide expert analysis, statistics, player insights, match predictions, training advice, and sports news. Reply in ${language} language as a friendly sports expert: ${text}`;
    
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sportsPrompt }] }]
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const speak = async (text: string) => {
    try {
      const ttsResponse = await fetch(
        'https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCpu960hVq_cy_dZYf1DUVNrBaWJnpBCuk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: VOICE_LANG_CODES[language as keyof typeof VOICE_LANG_CODES],
              name: VOICE_NAMES[language as keyof typeof VOICE_NAMES]
            },
            audioConfig: {
              audioEncoding: 'MP3'
            }
          })
        }
      );

      const ttsData = await ttsResponse.json();
      const audio = new Audio('data:audio/mp3;base64,' + ttsData.audioContent);
      audio.play();
    } catch (err) {
      console.error('TTS Error:', err);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.lang = STT_LANG_CODES[language as keyof typeof STT_LANG_CODES];
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setChat(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const reply = await getGeminiReply(input);
      const botMessage: ChatMessage = { sender: 'bot', text: reply };
      setChat(prev => [...prev, botMessage]);
      await speak(reply);
    } catch (err) {
      console.error(err);
      alert('Error while talking to Gemini or TTS.');
    }

    setInput('');
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageCircle size={24} />
          <h3 className="font-semibold text-lg">Sports Expert Chatbot</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Language Selector */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language:
        </label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="english">English 🇺🇸</option>
          <option value="hindi">Hindi 🇮🇳</option>
          <option value="marathi">Marathi 🇮🇳</option>
          <option value="gujarati">Gujarati 🇮🇳</option>
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chat.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Volume2 size={48} className="mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium">Welcome to your Sports Expert Assistant!</p>
            <p className="text-sm mt-2">Ask me about any sport, player statistics, match analysis, or training tips!</p>
          </div>
        )}
        
        {chat.map((msg, i) => (
          <div 
            key={i} 
            className={`mb-4 p-3 rounded-lg max-w-[80%] ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white ml-auto' 
                : 'bg-white shadow-sm border border-gray-200'
            }`}
          >
            <div className={`font-semibold mb-1 text-xs ${
              msg.sender === 'user' ? 'text-blue-100' : 'text-green-800'
            }`}>
              {msg.sender === 'user' ? '🏃‍♂️ You' : '🏆 Sports Expert'}
            </div>
            <div className={msg.sender === 'user' ? 'text-white' : 'text-gray-800'}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-[80%]">
            <div className="font-semibold mb-1 text-green-800 text-xs">🏆 Sports Expert</div>
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Analyzing your sports query...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={`Ask about sports in ${language}...`}
            disabled={loading || isListening}
          />
          
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        
        {isListening && (
          <p className="text-xs text-red-600 animate-pulse">
            🎤 Listening... Speak now!
          </p>
        )}
        
        {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <p className="text-xs text-gray-500">
            Voice input not supported in this browser
          </p>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Use the microphone button for voice input or type your sports questions!
        </div>
      </div>
    </div>
  );
}