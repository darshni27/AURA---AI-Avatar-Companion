import React, { useState } from 'react';

interface EmailVerificationScreenProps {
  onReturnToLogin: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ onReturnToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
    }
    // Simulate sending a verification email
    setMessage(`A verification link has been sent to ${email}. Please check your inbox.`);
    setEmail('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,50,150,0.3),rgba(0,0,0,0))]"></div>

      <div className="z-10 text-center max-w-sm w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff, 0 0 20px #0ff' }}>
          VERIFY IDENTITY
        </h1>
        <p className="text-lg text-blue-200 mb-8">
          A verification link will be sent to your email.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col items-center gap-4 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full max-w-xs bg-blue-900/30 border border-blue-500/50 text-cyan-200 placeholder-blue-400/60 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            required
            autoComplete="email"
          />

          <button
            type="submit"
            className="w-full max-w-xs mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,255,0.5)] disabled:opacity-50"
            disabled={!email.trim()}
          >
            SEND VERIFICATION
          </button>
        </form>
        
        {message && <p className="text-green-300 text-sm mt-4">{message}</p>}

        <button
          onClick={onReturnToLogin}
          className="mt-8 text-blue-300 hover:text-cyan-300 transition-colors duration-300 underline"
        >
          &larr; Return to Connection Screen
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
    </div>
  );
};

export default EmailVerificationScreen;
