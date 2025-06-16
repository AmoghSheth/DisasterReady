import React, { createContext, useContext, useState, useEffect } from 'react';

interface HouseholdData {
  size: number;
  pets: string[];
  medicalNeeds: string[];
  supplies: {
    [key: string]: {
      quantity: number;
      completed: boolean;
    };
  };
}

interface HouseholdContextType {
  household: HouseholdData;
  updateHousehold: (data: Partial<HouseholdData>) => void;
  updateSupply: (item: string, quantity: number, completed: boolean) => void;
}

const defaultHousehold: HouseholdData = {
  size: 1,
  pets: [],
  medicalNeeds: [],
  supplies: {}
};

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [household, setHousehold] = useState<HouseholdData>(() => {
    const saved = localStorage.getItem('householdData');
    return saved ? JSON.parse(saved) : defaultHousehold;
  });

  useEffect(() => {
    localStorage.setItem('householdData', JSON.stringify(household));
  }, [household]);

  const updateHousehold = (data: Partial<HouseholdData>) => {
    setHousehold(prev => ({ ...prev, ...data }));
  };

  const updateSupply = (item: string, quantity: number, completed: boolean) => {
    setHousehold(prev => ({
      ...prev,
      supplies: {
        ...prev.supplies,
        [item]: { quantity, completed }
      }
    }));
  };

  return (
    <HouseholdContext.Provider value={{ household, updateHousehold, updateSupply }}>
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