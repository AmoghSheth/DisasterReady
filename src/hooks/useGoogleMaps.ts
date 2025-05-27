
import { useState, useEffect, useRef } from 'react';
import { GoogleMapsService, Location, PlaceResult } from '@/utils/googleMaps';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapsService = useRef<GoogleMapsService | null>(null);

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        mapsService.current = GoogleMapsService.getInstance();
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, []);

  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!mapsService.current) return null;
    
    setIsLoadingLocation(true);
    try {
      const location = await mapsService.current.getCurrentLocation();
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const geocodeZipCode = async (zipCode: string): Promise<Location | null> => {
    if (!mapsService.current) return null;
    
    try {
      const location = await mapsService.current.geocodeZipCode(zipCode);
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error geocoding zip code:', error);
      return null;
    }
  };

  const findNearbyPlaces = async (
    location: Location, 
    type: string, 
    radius?: number
  ): Promise<PlaceResult[]> => {
    if (!mapsService.current) return [];
    
    try {
      return await mapsService.current.findNearbyPlaces(location, type, radius);
    } catch (error) {
      console.error('Error finding nearby places:', error);
      return [];
    }
  };

  return {
    isLoaded,
    currentLocation,
    isLoadingLocation,
    mapsService: mapsService.current,
    getCurrentLocation,
    geocodeZipCode,
    findNearbyPlaces,
  };
};
