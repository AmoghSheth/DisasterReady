import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HouseholdData {
  supplies: {
    [key: string]: {
      quantity: number;
      completed: boolean;
    };
  };
}

interface HouseholdContextType {
  household: HouseholdData;
  updateSupply: (item: string, quantity: number, completed: boolean) => void;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [householdSupplies, setHouseholdSupplies] = useState<HouseholdData['supplies']>(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`householdSupplies_${user.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`householdSupplies_${user.id}`, JSON.stringify(householdSupplies));
    }
  }, [householdSupplies, user]);

  const updateSupply = useCallback((item: string, quantity: number, completed: boolean) => {
    setHouseholdSupplies(prev => ({
      ...prev,
      [item]: { quantity, completed }
    }));
  }, []);

  const household = { supplies: householdSupplies };

  return (
    <HouseholdContext.Provider value={{ household, updateSupply }}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}; 