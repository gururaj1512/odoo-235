import { Volume2 } from 'lucide-react';

interface VoiceNavigationButtonProps {
  onClick: () => void;
}

const VoiceNavigationButton: React.FC<VoiceNavigationButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 right-4 z-40 group">
      <button
        onClick={onClick}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        title="Voice Navigation (Ctrl/Cmd + V)"
      >
        <Volume2 size={24} />
      </button>
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Ctrl+V
      </div>
    </div>
  );
};

export default VoiceNavigationButton;