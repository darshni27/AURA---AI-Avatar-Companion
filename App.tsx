import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);

  const handleLogin = useCallback((name: string) => {
    if (name.trim()) {
      setUserName(name.trim());
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUserName(null);
  }, []);

  const renderContent = () => {
    if (userName) {
      return <ChatScreen userName={userName} onLogout={handleLogout} />;
    }
    return <LoginScreen onLogin={handleLogin} />;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;