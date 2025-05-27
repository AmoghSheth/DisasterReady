
import { useState, useEffect, useRef } from 'react';
import { GoogleMapsService, Location, PlaceResult } from '@/utils/googleMaps';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapsService = useRef<GoogleMapsService | null>(null);

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if ((window as any).google && (window as any).google.maps) {
        console.log('Google Maps API is available');
        setIsLoaded(true);
        mapsService.current = GoogleMapsService.getInstance();
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Listen for the custom event
    const handleGoogleMapsLoaded = () => {
      console.log('Google Maps loaded event received');
      setTimeout(() => {
        if (checkGoogleMapsLoaded()) {
          console.log('Google Maps successfully initialized');
        }
      }, 100);
    };

    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);

    // Fallback polling
    const pollInterval = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        clearInterval(pollInterval);
      }
    }, 200);

    // Cleanup
    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      clearInterval(pollInterval);
    };
  }, []);

  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!mapsService.current) {
      console.error('Google Maps service not available');
      return null;
    }
    
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
    if (!mapsService.current) {
      console.error('Google Maps service not available');
      return null;
    }
    
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
    if (!mapsService.current) {
      console.error('Google Maps service not available');
      return [];
    }
    
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
