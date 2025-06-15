
import { useState, useRef } from 'react';
import { GoogleMapsService, Location, PlaceResult } from '@/utils/googleMaps';

export const useGoogleMaps = () => {
  const [error, setError] = useState<string | null>(null);
  const mapsService = useRef<GoogleMapsService | null>(null);

  // Initialize service when needed
  const getService = () => {
    if (!mapsService.current) {
      mapsService.current = GoogleMapsService.getInstance();
    }
    return mapsService.current;
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    setError(null);
    try {
      const service = getService();
      return await service.getCurrentLocation();
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Error getting current location');
      return null;
    }
  };

  const geocodeZipCode = async (zipCode: string): Promise<Location | null> => {
    setError(null);
    try {
      const service = getService();
      return await service.geocodeZipCode(zipCode);
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
    try {
      const service = getService();
      return await service.findNearbyPlaces(location, type, radius);
    } catch (error) {
      console.error('Error finding nearby places:', error);
      return [];
    }
  };

  return {
    error,
    mapsService: getService(),
    getCurrentLocation,
    geocodeZipCode,
    findNearbyPlaces,
  };
};
