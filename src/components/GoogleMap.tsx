
import React, { useEffect, useRef } from 'react';
import { useGoogleMapsContext } from '@/contexts/GoogleMapsContext';
import { Location } from '@/utils/googleMaps';

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
  const markerInstancesRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { isLoaded } = useGoogleMapsContext();

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapId: 'DISASTER_READY_MAP',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      onMapReady?.(mapInstanceRef.current);
    }
  }, [isLoaded, center, zoom, onMapReady]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      markerInstancesRef.current.forEach(marker => {
        marker.map = null;
      });
      markerInstancesRef.current = [];

      markers.forEach(markerData => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: markerData.position,
          map: mapInstanceRef.current,
          title: markerData.title,
        });
        markerInstancesRef.current.push(marker);
      });
    }
  }, [isLoaded, markers]);

  if (!isLoaded) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height }} className="rounded-xl" />;
};

export default GoogleMap;
