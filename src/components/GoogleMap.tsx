
import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
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

interface MapComponentProps {
  center: Location;
  zoom: number;
  markers: Array<{
    position: Location;
    title?: string;
    icon?: string;
  }>;
  onMapReady?: (map: google.maps.Map) => void;
}

const MapComponent = ({ center, zoom, markers, onMapReady }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  const addMarkers = () => {
    if (!mapInstanceRef.current) return;
    
    clearMarkers();
    
    markers.forEach(markerData => {
      if (mapInstanceRef.current) {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: mapInstanceRef.current,
          title: markerData.title,
          icon: markerData.icon,
        });
        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      
      mapInstanceRef.current = map;
      onMapReady?.(map);
    }
  }, [center, zoom, onMapReady]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    addMarkers();
  }, [markers]);

  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full bg-red-50 border border-red-200">
          <div className="text-center p-4">
            <p className="text-red-600 text-sm">Error loading Google Maps</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const GoogleMap = ({ 
  center, 
  zoom = 12, 
  height = '300px', 
  markers = [],
  onMapReady 
}: GoogleMapProps) => {
  return (
    <div 
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden bg-gray-200 relative"
    >
      <Wrapper
        apiKey="AIzaSyCOUApwzid4BeHZb3AE_sy8KILH0e0xkco"
        libraries={['places']}
        render={render}
      >
        <MapComponent
          center={center}
          zoom={zoom}
          markers={markers}
          onMapReady={onMapReady}
        />
      </Wrapper>
    </div>
  );
};

export default GoogleMap;
