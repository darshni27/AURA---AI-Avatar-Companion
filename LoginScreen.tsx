import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const toggleMode = () => {
    setMode(prev => (prev === 'LOGIN' ? 'SIGNUP' : 'LOGIN'));
    setError('');
    setEmail('');
    setPassword('');
    setCallsign('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('aura_users') || '[]');

    if (mode === 'SIGNUP') {
      if (!callsign.trim() || !email.trim() || !password.trim()) {
        setError('All fields are required.');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (users.some((user: any) => user.email === email)) {
        setError('An account with this email already exists.');
        return;
      }
      if (users.some((user: any) => user.callsign.toLowerCase() === callsign.toLowerCase())) {
        setError('This callsign is already taken.');
        return;
      }

      const newUser = { email, password, callsign };
      localStorage.setItem('aura_users', JSON.stringify([...users, newUser]));
      onLogin(callsign);
    } else { // LOGIN mode
      if (!email.trim() || !password.trim()) {
        setError('Email and password are required.');
        return;
      }
      const user = users.find((user: any) => user.email === email);
      if (!user) {
        setError('No account found with this email.');
        return;
      }
      if (user.password !== password) {
        setError('Incorrect password.');
        return;
      }
      onLogin(user.callsign);
    }
  };
  
  const isButtonDisabled = mode === 'LOGIN' 
    ? !email.trim() || !password.trim() 
    : !email.trim() || !password.trim() || !callsign.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 relative overflow-hidden">
      {!showForm && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-900/50 border border-blue-500/50 text-cyan-200 rounded-lg px-6 py-2 text-sm font-bold hover:bg-blue-800/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          >
            LOGIN / SIGN UP
          </button>
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,50,150,0.3),rgba(0,0,0,0))]"></div>
      
      <div className="z-10 text-center max-w-sm w-full">
        <h1 className="text-6xl md:text-8xl font-bold text-cyan-300 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #0ff, 0 0 20px #0ff' }}>
          AURA
        </h1>
        <p className="text-lg md:text-xl text-blue-200 mb-8">
          Establish your connection.
        </p>

        {showForm && (
          <div className="form-fade-in w-full">
            <div className="flex justify-center mb-6">
              <button onClick={toggleMode} className="text-blue-300 hover:text-cyan-200 transition-colors">
                {mode === 'LOGIN' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full max-w-xs bg-blue-900/30 border border-blue-500/50 text-cyan-200 placeholder-blue-400/60 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                required
                autoComplete="email"
              />
               {mode === 'SIGNUP' && (
                 <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="Create your callsign"
                  className="w-full max-w-xs bg-blue-900/30 border border-blue-500/50 text-cyan-200 placeholder-blue-400/60 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  required
                  autoComplete="username"
                />
              )}
               <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full max-w-xs bg-blue-900/30 border border-blue-500/50 text-cyan-200 placeholder-blue-400/60 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                required
                autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <button
                type="submit"
                className="w-full max-w-xs mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                disabled={isButtonDisabled}
              >
                {mode === 'LOGIN' ? 'INITIALIZE CONNECTION' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        )}
      </div>
       <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
    </div>
  );
};

const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.form-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
if (document.head) {
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default LoginScreen;