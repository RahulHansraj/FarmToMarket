import { createContext, useContext, useState, ReactNode } from 'react';

interface FarmData {
  crop: string;
  quantity: number;
  harvestDate: string;
  location: string;
  storage: string;
}

interface UserContextType {
  farmData: FarmData | null;
  setFarmData: (data: FarmData) => void;
  confirmedMarkets: any[];
  addConfirmedMarket: (market: any) => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotification: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [confirmedMarkets, setConfirmedMarkets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addConfirmedMarket = (market: any) => {
    setConfirmedMarkets(prev => [...prev, market]);
  };

  const addNotification = (notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now().toString() }]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <UserContext.Provider value={{
      farmData,
      setFarmData,
      confirmedMarkets,
      addConfirmedMarket,
      notifications,
      addNotification,
      clearNotification,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
