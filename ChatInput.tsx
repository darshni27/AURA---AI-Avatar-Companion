import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onVoiceInput: () => void;
  isListening: boolean;
  isLoading: boolean;
}

const MicIcon: React.FC<{ isListening: boolean }> = ({ isListening }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isListening ? 'text-red-400' : 'text-cyan-400'}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
  </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onVoiceInput, isListening, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-4">
      <div className="relative flex-grow">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isLoading ? "AURA is thinking..." : (isListening ? "Listening..." : "Type your message or use the mic...")}
          className="w-full bg-blue-900/50 border border-blue-500/50 text-cyan-200 placeholder-blue-400/70 rounded-full px-6 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-inner shadow-black/50"
          disabled={isLoading || isListening}
        />
      </div>
      <button
        type="button"
        onClick={onVoiceInput}
        disabled={isLoading}
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500/50 ring-2 ring-red-400 animate-pulse' : 'bg-cyan-500/30 hover:bg-cyan-500/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Toggle voice input"
      >
        <MicIcon isListening={isListening} />
      </button>
       <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:bg-blue-800 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default ChatInput;
