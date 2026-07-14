import React from 'react';
import { type Message, MessageSender } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-800/50 border border-blue-500 flex-shrink-0 flex items-center justify-center shadow-md">
           <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(0,255,255,0.5)]"></div>
        </div>
      )}
      <div 
        className={`max-w-md md:max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl text-white/90 shadow-lg ${isUser ? 'bg-blue-600/70 rounded-br-none' : 'bg-gray-800/70 rounded-bl-none'}`}
        style={!isUser ? { textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' } : {}}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
