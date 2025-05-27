
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

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return;

      mapsService.current = GoogleMapsService.getInstance();
      
      try {
        const map = await mapsService.current.initializeMap(
          mapRef.current.id,
          center,
          zoom
        );
        mapInstanceRef.current = map;

        // Add markers
        markers.forEach(marker => {
          mapsService.current?.addMarker(
            marker.position,
            marker.title,
            marker.icon
          );
        });

        onMapReady?.(map);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps) {
          initializeMap();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }
  }, [center, zoom, markers, onMapReady]);

  return (
    <div 
      ref={mapRef}
      id={`map-${Math.random().toString(36).substr(2, 9)}`}
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden"
    />
  );
};

export default GoogleMap;
