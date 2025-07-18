
import { useState, useRef, useEffect } from 'react';
import { GoogleMapsService, Location, PlaceResult } from '@/utils/googleMaps';

// This hook centralizes the Google Maps service initialization and usage.
export const useGoogleMaps = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapsService = useRef<GoogleMapsService | null>(null);

  useEffect(() => {
    // Ensure the service is initialized only once.
    if (!mapsService.current) {
      mapsService.current = GoogleMapsService.getInstance();
      mapsService.current.load().then(() => {
        setIsLoaded(true);
      }).catch(e => {
        console.error("Failed to load Google Maps script:", e);
        setError("Failed to load Google Maps script.");
      });
    }
  }, []);

  const getService = () => {
    if (!mapsService.current || !isLoaded) {
      // We can throw an error or handle it gracefully
      console.warn("Google Maps service is not loaded yet.");
      // This will be null if not loaded, so callers must handle it.
    }
    return mapsService.current;
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    setError(null);
    const service = getService();
    if (!service) return null;
    try {
      return await service.getCurrentLocation();
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Error getting current location');
      return null;
    }
  };

  const geocodeZipCode = async (zipCode: string): Promise<Location | null> => {
    setError(null);
    const service = getService();
    if (!service) return null;
    try {
      return await service.geocodeZipCode(zipCode);
    } catch (error) {
      console.error('Error geocoding zip code:', error);
      setError('Error geocoding zip code');
      return null;
    }
  };

  const reverseGeocode = async (location: Location): Promise<any | null> => {
    setError(null);
    const service = getService();
    if (!service) return null;
    try {
      return await service.reverseGeocode(location);
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      setError('Error during reverse geocoding');
      return null;
    }
  };

  const findNearbyPlaces = async (
    location: Location, 
    type: string, 
    radius?: number
  ): Promise<PlaceResult[]> => {
    const service = getService();
    if (!service) return [];
    try {
      return await service.findNearbyPlaces(location, type, radius);
    } catch (error) {
      console.error('Error finding nearby places:', error);
      return [];
    }
  };

  return {
    isLoaded,
    error,
    mapsService: getService(),
    getCurrentLocation,
    geocodeZipCode,
    reverseGeocode,
    findNearbyPlaces,
  };
};
