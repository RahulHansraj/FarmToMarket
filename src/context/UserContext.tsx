import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

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
  clearAllNotifications: () => void;
}

// Date.now() alone repeats when several notifications are added at once
let nextNotificationId = 0;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [confirmedMarkets, setConfirmedMarkets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addConfirmedMarket = useCallback((market: any) => {
    setConfirmedMarkets(prev => [...prev, market]);
  }, []);

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: `${Date.now()}-${nextNotificationId++}` }]);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(() => ({
    farmData,
    setFarmData,
    confirmedMarkets,
    addConfirmedMarket,
    notifications,
    addNotification,
    clearNotification,
    clearAllNotifications,
  }), [farmData, confirmedMarkets, notifications, addConfirmedMarket, addNotification, clearNotification, clearAllNotifications]);

  return (
    <UserContext.Provider value={value}>
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
