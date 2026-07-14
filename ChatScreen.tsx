import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Chat } from "@google/genai";
import { createChatSession } from '../services/geminiService';
import { textToSpeech, ELEVENLABS_VOICES } from '../services/elevenLabsService';
import { type Message, MessageSender, AvatarState } from '../types';
import Avatar from './Avatar';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

// Fix for SpeechRecognition API not being in standard TS DOM types
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatScreenProps {
  userName: string;
  onLogout: () => void;
}

const supportedLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'hi-IN', name: 'हिन्दी' },
  { code: 'ta-IN', name: 'தமிழ்' },
  { code: 'pt-BR', name: 'Português' },
];


const ChatScreen: React.FC<ChatScreenProps> = ({ userName, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>(AvatarState.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [voiceId, setVoiceId] = useState<string>(ELEVENLABS_VOICES[0].id);
  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatRef.current = createChatSession();
    const initialMessage: Message = {
        id: 'initial',
        sender: MessageSender.AI,
        text: `Hello, ${userName}! I'm AURA, your AI companion. I'm excited to talk with you. What's on your mind?`
    };
    setMessages([initialMessage]);
    void speak(initialMessage.text);
  }, [userName]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback(async (text: string) => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();
    
    if(!text) {
      setAvatarState(AvatarState.IDLE);
      return;
    }

    try {
      const audioBlob = await textToSpeech(text, voiceId);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play();

      audio.onplaying = () => setAvatarState(AvatarState.SPEAKING);
      audio.onended = () => {
        setAvatarState(AvatarState.IDLE);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setAvatarState(AvatarState.IDLE);
        URL.revokeObjectURL(audioUrl);
        console.error('Error playing audio from ElevenLabs.');
      };
    } catch (error) {
      console.warn("ElevenLabs TTS failed, falling back to browser synthesis:", error);
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0])) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
       if(selectedVoice) {
          utterance.voice = selectedVoice;
      }
      utterance.pitch = 0.8;
      utterance.rate = 1.0;
      utterance.onstart = () => setAvatarState(AvatarState.SPEAKING);
      utterance.onend = () => setAvatarState(AvatarState.IDLE);
      utterance.onerror = () => setAvatarState(AvatarState.IDLE);
      window.speechSynthesis.speak(utterance);
    }
  }, [language, voiceId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || avatarState === AvatarState.THINKING) return;

    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis.cancel();

    const userMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMessageId, sender: MessageSender.USER, text }]);
    setAvatarState(AvatarState.THINKING);

    const aiMessageId = userMessageId + '-ai';
    setMessages(prev => [...prev, { id: aiMessageId, sender: MessageSender.AI, text: '' }]);

    try {
        if (chatRef.current) {
            const stream = await chatRef.current.sendMessageStream({ message: text });
            
            let fullResponse = '';
            let firstChunk = true;

            for await (const chunk of stream) {
                if (firstChunk) {
                    setAvatarState(AvatarState.SPEAKING);
                    firstChunk = false;
                }
                
                const chunkText = chunk.text;
                fullResponse += chunkText;

                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
                ));
            }
            await speak(fullResponse);
        }
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = "I encountered a transmission error. Please try again.";
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        ));
        await speak(errorMessage);
    }
  }, [avatarState, speak]);


  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          void handleSendMessage(transcript);
        };
        recognition.onstart = () => {
            setIsListening(true);
            setAvatarState(AvatarState.LISTENING);
        };
        recognition.onend = () => {
            setIsListening(false);
            if(avatarState === AvatarState.LISTENING) {
                setAvatarState(AvatarState.IDLE);
            }
        };
        recognition.onerror = (event) => {
             console.error("Speech recognition error:", event.error);
             setIsListening(false);
            if(avatarState === AvatarState.LISTENING) {
                setAvatarState(AvatarState.IDLE);
            }
        }
        recognitionRef.current = recognition;
      }
    }

    if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            if (audioRef.current) audioRef.current.pause();
            window.speechSynthesis.cancel();
            setAvatarState(AvatarState.IDLE);
            recognitionRef.current.start();
        }
    }
  }, [isListening, handleSendMessage, avatarState, language]);
  
  const stateText = {
      [AvatarState.IDLE]: 'Awaiting Input',
      [AvatarState.LISTENING]: 'Listening...',
      [AvatarState.THINKING]: 'Processing...',
      [AvatarState.SPEAKING]: 'Transmitting...',
  }[avatarState];

  return (
    <div className="h-screen bg-black overflow-hidden relative flex">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,30,100,0.3),rgba(0,0,0,0)_70%)]"></div>

      {/* Left Panel: Avatar */}
      <div className="w-4/12 h-full">
        <Avatar state={avatarState} />
      </div>
      
      {/* Right Panel: Chat UI */}
      <div className="w-8/12 h-full flex flex-col bg-black/40 backdrop-blur-sm border-l-2 border-cyan-500/20 relative z-10">
        <div className="flex-shrink-0 p-4 flex justify-between items-center border-b-2 border-cyan-500/10">
           <p className="text-sm font-mono text-blue-300">CALLSIGN: <span className="text-cyan-300 font-bold tracking-wider">{userName}</span></p>
           <div className="flex items-center gap-4">
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="bg-blue-900/50 border border-blue-500/50 text-cyan-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 appearance-none cursor-pointer"
                style={{ paddingRight: '2.5rem', backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                aria-label="Select voice"
              >
                {ELEVENLABS_VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id} className="bg-blue-900 text-cyan-200">
                    {voice.name}
                  </option>
                ))}
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-blue-900/50 border border-blue-500/50 text-cyan-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 appearance-none cursor-pointer"
                style={{ paddingRight: '2.5rem', backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                aria-label="Select language"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-blue-900 text-cyan-200">
                    {lang.name}
                  </option>
                ))}
              </select>

               <button
                onClick={onLogout}
                className="bg-red-800/40 border border-red-600/50 text-red-300 rounded-lg px-4 py-2 text-sm font-bold hover:bg-red-700/50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                aria-label="End Connection"
              >
                END CONNECTION
              </button>
           </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messageEndRef} />
        </div>
        
        <p className={`text-center text-sm font-mono tracking-widest transition-colors duration-300 pb-2 ${avatarState === AvatarState.LISTENING ? 'text-red-400' : 'text-blue-300'}`}>
            {stateText}
        </p>

        <div className="flex-shrink-0 p-4 z-10">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onVoiceInput={handleVoiceInput}
            isListening={isListening}
            isLoading={avatarState === AvatarState.THINKING}
          />
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes bg-pan {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.bg-grid-pattern {
  background-image: linear-gradient(to right, rgba(0, 128, 255, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 128, 255, 0.2) 1px, transparent 1px);
  background-size: 40px 40px;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default ChatScreen;