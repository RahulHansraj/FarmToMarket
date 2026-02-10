import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phone: 'Phone Number',
    darkMode: 'Dark Mode',
    language: 'Language',
    dashboard: 'Dashboard',
    prices: 'Prices',
    weather: 'Weather',
    farmData: 'Farm Data',
    markets: 'Markets',
    profit: 'Profit',
    aiAssistant: 'AI Assistant',
    notifications: 'Notifications',
    logout: 'Logout',
    welcome: 'Welcome',
  },
  hi: {
    login: 'लॉग इन करें',
    signup: 'साइन अप करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    phone: 'फोन नंबर',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    dashboard: 'डैशबोर्ड',
    prices: 'कीमतें',
    weather: 'मौसम',
    farmData: 'खेत डेटा',
    markets: 'बाजार',
    profit: 'लाभ',
    aiAssistant: 'एआई सहायक',
    notifications: 'सूचनाएं',
    logout: 'लॉग आउट',
    welcome: 'स्वागत',
  },
  ta: {
    login: 'உள்நுழைக',
    signup: 'பதிவு செய்க',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    name: 'பெயர்',
    phone: 'தொலைபேசி எண்',
    darkMode: 'இருள் பயன்முறை',
    language: 'மொழி',
    dashboard: 'டாஷ்போர்டு',
    prices: 'விலைகள்',
    weather: 'வானிலை',
    farmData: 'பண்ணை தரவு',
    markets: 'சந்தைகள்',
    profit: 'லாபம்',
    aiAssistant: 'AI உதவியாளர்',
    notifications: 'அறிவிப்புகள்',
    logout: 'வெளியேறு',
    welcome: 'வரவேற்பு',
  },
  te: {
    login: 'లాగిన్',
    signup: 'సైన్ అప్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    name: 'పేరు',
    phone: 'ఫోన్ నంబర్',
    darkMode: 'డార్క్ మోడ్',
    language: 'భాష',
    dashboard: 'డాష్‌బోర్డ్',
    prices: 'ధరలు',
    weather: 'వాతావరణం',
    farmData: 'వ్యవసాయ డేటా',
    markets: 'మార్కెట్లు',
    profit: 'లాభం',
    aiAssistant: 'AI సహాయకుడు',
    notifications: 'నోటిఫికేషన్‌లు',
    logout: 'లాగౌట్',
    welcome: 'స్వాగతం',
  },
  kn: {
    login: 'ಲಾಗಿನ್',
    signup: 'ಸೈನ್ ಅಪ್',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    name: 'ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    language: 'ಭಾಷೆ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    prices: 'ಬೆಲೆಗಳು',
    weather: 'ಹವಾಮಾನ',
    farmData: 'ಕೃಷಿ ಡೇಟಾ',
    markets: 'ಮಾರುಕಟ್ಟೆಗಳು',
    profit: 'ಲಾಭ',
    aiAssistant: 'AI ಸಹಾಯಕ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    logout: 'ಲಾಗೌಟ್',
    welcome: 'ಸ್ವಾಗತ',
  },
  ml: {
    login: 'ലോഗിൻ',
    signup: 'സൈൻ അപ്പ്',
    email: 'ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    name: 'പേര്',
    phone: 'ഫോൺ നമ്പർ',
    darkMode: 'ഡാർക്ക് മോഡ്',
    language: 'ഭാഷ',
    dashboard: 'ഡാഷ്ബോർഡ്',
    prices: 'വിലകൾ',
    weather: 'കാലാവസ്ഥ',
    farmData: 'ഫാം ഡാറ്റ',
    markets: 'മാർക്കറ്റുകൾ',
    profit: 'ലാഭം',
    aiAssistant: 'AI അസിസ്റ്റന്റ്',
    notifications: 'അറിയിപ്പുകൾ',
    logout: 'ലോഗൗട്ട്',
    welcome: 'സ്വാഗതം',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
