
import { useState, useEffect, useRef } from 'react';
import { GoogleMapsService, Location, PlaceResult } from '@/utils/googleMaps';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapsService = useRef<GoogleMapsService | null>(null);

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        console.log('Google Maps API is available');
        setIsLoaded(true);
        setError(null);
        try {
          mapsService.current = GoogleMapsService.getInstance();
          return true;
        } catch (err) {
          console.error('Error initializing GoogleMapsService:', err);
          setError('Failed to initialize Google Maps service');
          return false;
        }
      }
      return false;
    };

    // Check if already loaded
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Listen for load success
    const handleGoogleMapsLoaded = () => {
      console.log('Google Maps loaded event received');
      setTimeout(() => {
        checkGoogleMapsLoaded();
      }, 100);
    };

    // Listen for load error
    const handleGoogleMapsError = () => {
      console.error('Google Maps failed to load');
      setError('Google Maps failed to load');
      setIsLoaded(false);
    };

    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
    window.addEventListener('google-maps-error', handleGoogleMapsError);

    // Cleanup
    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      window.removeEventListener('google-maps-error', handleGoogleMapsError);
    };
  }, []);

  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!mapsService.current) {
      console.error('Google Maps service not available');
      setError('Google Maps service not available');
      return null;
    }
    
    setIsLoadingLocation(true);
    setError(null);
    try {
      const location = await mapsService.current.getCurrentLocation();
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Error getting current location');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const geocodeZipCode = async (zipCode: string): Promise<Location | null> => {
    if (!mapsService.current) {
      console.error('Google Maps service not available');
      setError('Google Maps service not available');
      return null;
    }
    
    setError(null);
    try {
      const location = await mapsService.current.geocodeZipCode(zipCode);
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error geocoding zip code:', error);
      setError('Error geocoding zip code');
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
    error,
    mapsService: mapsService.current,
    getCurrentLocation,
    geocodeZipCode,
    findNearbyPlaces,
  };
};
