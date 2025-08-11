import { Volume2, Mic, Keyboard, ArrowRight } from 'lucide-react';

const VoiceDemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Volume2 size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Voice Navigation Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience hands-free navigation through our sports platform using voice commands
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Voice Commands */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Mic size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Voice Commands</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ArrowRight className="text-green-500" size={16} />
                <span className="text-gray-700">"Go to home"</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowRight className="text-green-500" size={16} />
                <span className="text-gray-700">"Go to nearby sports"</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowRight className="text-green-500" size={16} />
                <span className="text-gray-700">"Go to facilities"</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowRight className="text-green-500" size={16} />
                <span className="text-gray-700">"Open chatbot"</span>
              </div>
              <div className="flex items-center space-x-3">
                <ArrowRight className="text-green-500" size={16} />
                <span className="text-gray-700">"Show help"</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Keyboard size={24} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Open Voice Navigation</span>
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">
                  Ctrl + V
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Open Chatbot</span>
                <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono">
                  Click Chat Button
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Voice Navigation</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Activate</h3>
              <p className="text-gray-600 text-sm">
                Click the voice button or press Ctrl+V to open voice navigation
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Speak</h3>
              <p className="text-gray-600 text-sm">
                Click "Start Listening" and speak your command clearly
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Navigate</h3>
              <p className="text-gray-600 text-sm">
                The system will process your command and navigate automatically
              </p>
            </div>
          </div>
        </div>

        {/* Browser Support */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Browser Compatibility</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">✅ Supported Browsers</h3>
              <ul className="space-y-1 text-blue-100">
                <li>• Google Chrome (Recommended)</li>
                <li>• Microsoft Edge</li>
                <li>• Safari (macOS)</li>
                <li>• Firefox (Limited support)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚠️ Requirements</h3>
              <ul className="space-y-1 text-blue-100">
                <li>• Microphone access permission</li>
                <li>• HTTPS connection (required)</li>
                <li>• Modern browser version</li>
                <li>• Clear speech for best results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Use natural language like "go to home" or "open nearby sports"</li>
            <li>• Make sure your microphone is working and not muted</li>
            <li>• Try different phrasings if a command isn't recognized</li>
            <li>• Use the help button to see all available commands</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceDemoPage;