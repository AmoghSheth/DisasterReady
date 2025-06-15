
import React, { useEffect, useRef, useState } from 'react';
import { GoogleMapsService, Location } from '@/utils/googleMaps';

interface GoogleMapProps {
  center: Location;
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: Location;
    title?: string;
    icon?: string;
  }>;
  onMapReady?: (map: google.maps.Map) => void;
}

const GoogleMap = ({ 
  center, 
  zoom = 12, 
  height = '300px', 
  markers = [],
  onMapReady 
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializingRef = useRef(false);

  const clearMarkers = () => {
    try {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          try {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            }
          } catch (e) {
            // Ignore individual marker cleanup errors
          }
        });
        markersRef.current = [];
      }
    } catch (error) {
      console.warn('Error clearing markers:', error);
      markersRef.current = [];
    }
  };

  const cleanupMap = () => {
    try {
      clearMarkers();
      if (mapInstanceRef.current) {
        // Don't try to destroy the map, just clear the reference
        mapInstanceRef.current = null;
      }
    } catch (error) {
      console.warn('Error during map cleanup:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || !isMounted || initializingRef.current) {
        return;
      }

      if (!window.google?.maps) {
        console.log('Google Maps API not loaded yet');
        return;
      }

      initializingRef.current = true;
      
      try {
        setError(null);
        setIsLoading(true);
        
        // Clear any existing map
        cleanupMap();
        
        // Create new map
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        if (isMounted) {
          mapInstanceRef.current = map;
          setIsMapReady(true);
          setIsLoading(false);
          console.log('Map initialization complete');
          onMapReady?.(map);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted) {
          setError('Failed to load map');
          setIsLoading(false);
        }
      } finally {
        initializingRef.current = false;
      }
    };

    const handleMapsLoaded = () => {
      if (isMounted) {
        setTimeout(() => initializeMap(), 100);
      }
    };

    if (window.google?.maps) {
      initializeMap();
    } else {
      window.addEventListener('google-maps-loaded', handleMapsLoaded);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('google-maps-loaded', handleMapsLoaded);
      // Don't cleanup map in unmount to avoid DOM conflicts
      // Just clear references
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) {
      return;
    }

    console.log('Updating markers:', markers);
    
    clearMarkers();
    
    try {
      markers.forEach(marker => {
        if (mapInstanceRef.current) {
          const googleMarker = new google.maps.Marker({
            position: marker.position,
            map: mapInstanceRef.current,
            title: marker.title,
            icon: marker.icon,
          });
          markersRef.current.push(googleMarker);
        }
      });
    } catch (error) {
      console.warn('Error adding markers:', error);
    }
  }, [markers, isMapReady]);

  if (error) {
    return (
      <div 
        style={{ width: '100%', height }}
        className="rounded-xl overflow-hidden bg-red-50 flex items-center justify-center border border-red-200"
      >
        <div className="text-center p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden bg-gray-200 relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
