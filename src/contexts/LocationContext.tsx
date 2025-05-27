import React, { createContext, useContext, useState, useEffect } from 'react';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBtNkwIOuJ6GATeMJHdOtlfIPDKwWAEzvg';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coords?: Coordinates;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  isLoading: boolean;
  error?: string;
}

interface LocationContextType {
  location: LocationData;
  updateLocation: (data: Partial<LocationData>) => void;
  getCurrentLocation: () => Promise<void>;
  geocodeZipCode: (zipCode: string) => Promise<void>;
  geocodeAddress: (address: string) => Promise<void>;
  isGoogleMapsLoaded: boolean;
}

const defaultLocation: LocationData = {
  coords: { latitude: 37.7749, longitude: -122.4194 }, // Default to San Francisco
  isLoading: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>(() => {
    // Try to load from localStorage on initial render
    const savedLocation = localStorage.getItem('userLocation');
    return savedLocation ? { ...JSON.parse(savedLocation), isLoading: false } : defaultLocation;
  });
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Save to localStorage whenever location changes
  useEffect(() => {
    if (location.coords || location.zipCode) {
      localStorage.setItem('userLocation', JSON.stringify(location));
    }
  }, [location]);

  const updateLocation = (data: Partial<LocationData>) => {
    setLocation(prev => ({ ...prev, ...data }));
  };

  const getCurrentLocation = async (): Promise<void> => {
    updateLocation({ isLoading: true, error: undefined });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use Google Maps Geocoding API to get address details
      if (isGoogleMapsLoaded && window.google) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              try {
                if (status === 'OK' && results && results.length > 0) {
                  const addressComponents = results[0].address_components;
                  let zipCode = '';
                  let city = '';
                  let state = '';

                  // Extract components from the result
                  addressComponents.forEach((component: any) => {
                    if (component.types.includes('postal_code')) {
                      zipCode = component.short_name;
                    } else if (component.types.includes('locality')) {
                      city = component.long_name;
                    } else if (component.types.includes('administrative_area_level_1')) {
                      state = component.short_name;
                    }
                  });

                  updateLocation({
                    coords: { latitude, longitude },
                    address: results[0].formatted_address,
                    zipCode,
                    city,
                    state,
                    isLoading: false
                  });
                } else {
                  // Fallback to just coordinates if geocoding fails
                  updateLocation({
                    coords: { latitude, longitude },
                    isLoading: false,
                    error: 'Could not determine address from coordinates'
                  });
                }
              } catch (error) {
                // Handle any errors in the callback
                updateLocation({
                  coords: { latitude, longitude },
                  isLoading: false,
                  error: 'Error processing geocoding results'
                });
              }
            }
          );
        } catch (error) {
          // Fallback if geocoder throws an error
          updateLocation({
            coords: { latitude, longitude },
            isLoading: false,
            error: 'Error initializing geocoder'
          });
        }
      } else {
        // Fallback if Google Maps API is not loaded
        updateLocation({
          coords: { latitude, longitude },
          isLoading: false
        });
      }
    } catch (error) {
      updateLocation({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
      throw error;
    }
  };

  const geocodeZipCode = async (zipCode: string): Promise<void> => {
    updateLocation({ isLoading: true, error: undefined });

    try {
      if (!isGoogleMapsLoaded) {
        throw new Error('Google Maps API not loaded');
      }

      const geocoder = new window.google.maps.Geocoder();
      
      const results = await new Promise<any>((resolve, reject) => {
        geocoder.geocode(
          { address: zipCode, region: 'us' },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results);
            } else {
              reject(new Error('Could not find location for this ZIP code'));
            }
          }
        );
      });

      const location = results[0].geometry.location;
      const addressComponents = results[0].address_components;
      let city = '';
      let state = '';

      // Extract components from the result
      addressComponents.forEach((component: any) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      });

      updateLocation({
        coords: { 
          latitude: location.lat(), 
          longitude: location.lng() 
        },
        address: results[0].formatted_address,
        zipCode,
        city,
        state,
        isLoading: false
      });
    } catch (error) {
      updateLocation({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
      throw error;
    }
  };

  const geocodeAddress = async (address: string): Promise<void> => {
    updateLocation({ isLoading: true, error: undefined });

    try {
      if (!isGoogleMapsLoaded) {
        throw new Error('Google Maps API not loaded');
      }

      const geocoder = new window.google.maps.Geocoder();
      
      const results = await new Promise<any>((resolve, reject) => {
        geocoder.geocode(
          { address },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results);
            } else {
              reject(new Error('Could not find location for this address'));
            }
          }
        );
      });

      const location = results[0].geometry.location;
      const addressComponents = results[0].address_components;
      let zipCode = '';
      let city = '';
      let state = '';

      // Extract components from the result
      addressComponents.forEach((component: any) => {
        if (component.types.includes('postal_code')) {
          zipCode = component.short_name;
        } else if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      });

      updateLocation({
        coords: { 
          latitude: location.lat(), 
          longitude: location.lng() 
        },
        address: results[0].formatted_address,
        zipCode,
        city,
        state,
        isLoading: false
      });
    } catch (error) {
      updateLocation({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
      throw error;
    }
  };

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        updateLocation, 
        getCurrentLocation, 
        geocodeZipCode,
        geocodeAddress,
        isGoogleMapsLoaded
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationProvider; 