import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          {!isLoggedIn ? (
            <LoginPage onLogin={() => setIsLoggedIn(true)} />
          ) : (
            <Dashboard onLogout={() => setIsLoggedIn(false)} />
          )}
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
