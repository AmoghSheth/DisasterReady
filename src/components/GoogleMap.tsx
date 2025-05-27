
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
  const mapsService = useRef<GoogleMapsService | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        console.log('Map ref not available');
        return;
      }

      if (!(window as any).google || !(window as any).google.maps) {
        console.log('Google Maps API not loaded yet');
        return;
      }

      console.log('Initializing Google Map with center:', center);
      
      try {
        setError(null);
        mapsService.current = GoogleMapsService.getInstance();
        
        const map = await mapsService.current.initializeMap(
          mapId.current,
          center,
          zoom
        );
        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Clear existing markers and add new ones
        clearMarkers();
        markers.forEach(marker => {
          const googleMarker = mapsService.current?.addMarker(
            marker.position,
            marker.title,
            marker.icon
          );
          if (googleMarker) {
            markersRef.current.push(googleMarker);
          }
        });

        onMapReady?.(map);
        console.log('Map initialization complete');
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load map. Please try refreshing the page.');
      }
    };

    const checkAndInit = () => {
      if ((window as any).google && (window as any).google.maps) {
        initializeMap();
      } else {
        console.log('Waiting for Google Maps to load...');
        setTimeout(checkAndInit, 200);
      }
    };

    checkAndInit();
  }, [center, zoom, onMapReady]);

  // Update markers when they change
  useEffect(() => {
    if (mapInstanceRef.current && mapsService.current && isMapReady) {
      console.log('Updating markers:', markers);
      
      // Clear existing markers
      clearMarkers();
      
      // Add new markers
      markers.forEach(marker => {
        const googleMarker = mapsService.current?.addMarker(
          marker.position,
          marker.title,
          marker.icon
        );
        if (googleMarker) {
          markersRef.current.push(googleMarker);
        }
      });
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
      id={mapId.current}
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden bg-gray-200 relative"
    >
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
