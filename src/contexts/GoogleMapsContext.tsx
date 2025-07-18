
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleMapsService } from '@/utils/googleMaps';

interface GoogleMapsContextType {
  mapsService: GoogleMapsService | null;
  isLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  mapsService: null,
  isLoaded: false,
});

export const useGoogleMapsContext = () => useContext(GoogleMapsContext);

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const [mapsService, setMapsService] = useState<GoogleMapsService | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const service = GoogleMapsService.getInstance();
    service.load()
      .then(() => {
        setMapsService(service);
        setIsLoaded(true);
      })
      .catch(error => {
        console.error("Failed to load Google Maps from provider:", error);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ mapsService, isLoaded }}>
      {isLoaded ? children : <div>Loading Maps...</div>}
    </GoogleMapsContext.Provider>
  );
};
