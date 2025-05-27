
import React, { useEffect, useRef } from 'react';
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
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        console.log('Map ref not available');
        return;
      }

      if (!(window as any).google) {
        console.log('Google Maps API not loaded');
        return;
      }

      console.log('Initializing Google Map...');
      
      try {
        mapsService.current = GoogleMapsService.getInstance();
        
        const map = await mapsService.current.initializeMap(
          mapId.current,
          center,
          zoom
        );
        mapInstanceRef.current = map;

        // Clear existing markers and add new ones
        markers.forEach(marker => {
          mapsService.current?.addMarker(
            marker.position,
            marker.title,
            marker.icon
          );
        });

        onMapReady?.(map);
        console.log('Map initialization complete');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if ((window as any).google && (window as any).google.maps) {
      initializeMap();
    } else {
      console.log('Waiting for Google Maps to load...');
      const checkGoogleMaps = () => {
        if ((window as any).google && (window as any).google.maps) {
          initializeMap();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }
  }, [center, zoom, markers, onMapReady]);

  // Update markers when they change
  useEffect(() => {
    if (mapInstanceRef.current && mapsService.current) {
      console.log('Updating markers:', markers);
      // Note: In a production app, you'd want to properly manage marker instances
      // For now, we'll rely on the map re-initialization to handle marker updates
    }
  }, [markers]);

  return (
    <div 
      ref={mapRef}
      id={mapId.current}
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden bg-gray-200"
    />
  );
};

export default GoogleMap;
