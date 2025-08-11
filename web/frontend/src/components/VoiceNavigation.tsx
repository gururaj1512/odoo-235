import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, X, Settings, HelpCircle } from 'lucide-react';

interface VoiceNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface VoiceCommand {
  command: string;
  description: string;
  action: string;
  keywords: string[];
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = [
    {
      command: 'go to home',
      description: 'Navigate to the home page',
      action: '/',
      keywords: ['home', 'main', 'landing', 'start']
    },
    {
      command: 'go to nearby sports',
      description: 'Open the nearby sports map',
      action: '/nearby-sports',
      keywords: ['nearby', 'sports', 'map', 'venues', 'facilities']
    },
    {
      command: 'go to facilities',
      description: 'View all sports facilities',
      action: '/facilities',
      keywords: ['facilities', 'courts', 'venues', 'places']
    },
    {
      command: 'go to bookings',
      description: 'View your bookings',
      action: '/bookings',
      keywords: ['bookings', 'reservations', 'my bookings', 'schedule']
    },
    {
      command: 'go to dashboard',
      description: 'Access your dashboard',
      action: '/dashboard',
      keywords: ['dashboard', 'profile', 'account', 'my account']
    },
    {
      command: 'go to login',
      description: 'Go to login page',
      action: '/login',
      keywords: ['login', 'sign in', 'log in']
    },
    {
      command: 'go to register',
      description: 'Go to registration page',
      action: '/register',
      keywords: ['register', 'sign up', 'create account']
    },
    {
      command: 'open chatbot',
      description: 'Open the sports expert chatbot',
      action: 'chatbot',
      keywords: ['chatbot', 'chat', 'assistant', 'help', 'sports expert']
    },
    {
      command: 'close voice navigation',
      description: 'Close voice navigation',
      action: 'close',
      keywords: ['close', 'stop', 'exit', 'quit']
    },
    {
      command: 'show help',
      description: 'Show available voice commands',
      action: 'help',
      keywords: ['help', 'commands', 'what can I say', 'instructions']
    },
    {
      command: 'go to voice demo',
      description: 'Open voice navigation demo page',
      action: '/voice-demo',
      keywords: ['voice demo', 'demo', 'voice navigation demo', 'voice tutorial']
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase());
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setTranscript('No speech detected. Please try again.');
        } else {
          setTranscript(`Error: ${event.error}`);
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  // Process voice commands
  const processVoiceCommand = useCallback((command: string) => {
    console.log('Processing command:', command);
    
    // Check for exact matches first
    const exactMatch = voiceCommands.find(cmd => 
      cmd.command.toLowerCase() === command || 
      cmd.keywords.some(keyword => command.includes(keyword))
    );
    
    if (exactMatch) {
      setLastCommand(`${exactMatch.command} - ${exactMatch.description}`);
      
      if (exactMatch.action === 'close') {
        onClose();
      } else if (exactMatch.action === 'help') {
        setShowHelp(true);
      } else if (exactMatch.action === 'chatbot') {
        // Trigger chatbot - you can implement this based on your chatbot state
        console.log('Opening chatbot...');
      } else {
        onNavigate(exactMatch.action);
        onClose();
      }
    } else {
      setLastCommand(`Command not recognized: "${command}"`);
    }
  }, [onNavigate, onClose]);

  // Start listening
  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  // Speak feedback
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Volume2 size={24} />
            <h3 className="font-semibold text-lg">Voice Navigation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔇</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Voice Navigation Not Supported
              </h3>
              <p className="text-gray-600 text-sm">
                Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
              </p>
            </div>
          ) : (
            <>
              {/* Status */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-gray-200'
                }`}>
                  {isListening ? (
                    <MicOff size={32} className="text-white" />
                  ) : (
                    <Mic size={32} className="text-gray-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {isListening ? 'Listening...' : 'Ready for Voice Commands'}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {isListening ? 'Speak your command now' : 'Click the microphone to start'}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">You said:</span> {transcript}
                  </p>
                </div>
              )}

              {/* Last Command */}
              {lastCommand && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Action:</span> {lastCommand}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!isSupported}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
                
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <HelpCircle size={20} />
                </button>
              </div>

              {/* Help Section */}
              {showHelp && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Available Commands:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {voiceCommands.map((cmd, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-blue-600">"{cmd.command}"</span>
                        <span className="text-gray-600"> - {cmd.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Commands */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Quick Commands:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {voiceCommands.slice(0, 6).map((cmd, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        speak(cmd.command);
                        processVoiceCommand(cmd.command);
                      }}
                      className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors text-left"
                    >
                      {cmd.command}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceNavigation;