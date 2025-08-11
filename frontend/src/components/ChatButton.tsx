import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
      title="Chat with Sports Expert"
    >
      <MessageCircle size={20} className="sm:w-6 sm:h-6" />
    </button>
  );
}