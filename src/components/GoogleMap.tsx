import React, { useEffect, useRef, useState } from 'react';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

// Define props interface for the GoogleMap component
interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: any;
    category?: 'shelter' | 'medical' | 'default';
    description?: string;
  }>;
  onMapClick?: (event: any) => void;
  onMapLoad?: (map: any) => void;
  showDirections?: boolean;
  destination?: { lat: number; lng: number };
  className?: string;
  highlightCurrentLocation?: boolean;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBtNkwIOuJ6GATeMJHdOtlfIPDKwWAEzvg';

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 13,
  markers = [],
  onMapClick,
  onMapLoad,
  showDirections = false,
  destination,
  className = '',
  highlightCurrentLocation = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [activeMarkers, setActiveMarkers] = useState<any[]>([]);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);

      return () => {
        // Clean up script if component unmounts during loading
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize map once script is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center,
      zoom,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    // Create info window for marker details
    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    if (onMapLoad) {
      onMapLoad(newMap);
    }

    if (onMapClick) {
      newMap.addListener('click', onMapClick);
    }

    const newDirectionsService = new window.google.maps.DirectionsService();
    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    setDirectionsService(newDirectionsService);
    setDirectionsRenderer(newDirectionsRenderer);
  };

  // Add markers to map
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear previous markers
    activeMarkers.forEach(marker => marker.setMap(null));

    // Add current location marker if requested
    const allMarkers = [...markers];
    
    if (highlightCurrentLocation) {
      allMarkers.unshift({
        position: center,
        title: 'Current Location',
        category: 'default'
      });
    }

    const newMarkers = allMarkers.map((markerData) => {
      // Get icon based on category
      let icon = markerData.icon;
      
      if (!icon && markerData.category) {
        switch (markerData.category) {
          case 'shelter':
            icon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#e67e22',
              fillOpacity: 0.9,
              strokeWeight: 1,
              strokeColor: '#ffffff',
              scale: 10
            };
            break;
          case 'medical':
            icon = {
              path: 'M19 3h-4v2h4v4h2V5h4V3h-4V-1h-2v4zm-4 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10z',
              fillColor: '#e74c3c',
              fillOpacity: 0.9,
              strokeWeight: 1,
              strokeColor: '#ffffff',
              scale: 1.2,
              anchor: new window.google.maps.Point(15, 15)
            };
            break;
          default:
            icon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#3498db',
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: markerData.title === 'Current Location' ? 8 : 6
            };
        }
      }

      // Create the marker
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon,
        animation: markerData.title === 'Current Location' 
          ? window.google.maps.Animation.BOUNCE 
          : window.google.maps.Animation.DROP,
        zIndex: markerData.title === 'Current Location' ? 1 : 10
      });

      // Add click event to show info window
      marker.addListener('click', () => {
        const content = `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #333;">${markerData.title || 'Location'}</h3>
            ${markerData.description ? `<p style="margin: 0; font-size: 14px;">${markerData.description}</p>` : ''}
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setActiveMarkers(newMarkers);

    // Set appropriate bounds
    if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }

    return () => {
      // Clean up markers when component updates or unmounts
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, infoWindow, markers, center, highlightCurrentLocation]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && !showDirections) {
      map.setCenter(center);
    }
  }, [map, center, showDirections]);

  // Show directions if requested
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer || !showDirections || !destination) return;

    const currentLocation = center;

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          
          // Hide markers when showing directions
          activeMarkers.forEach(marker => {
            marker.setVisible(false);
          });
        }
      }
    );

    return () => {
      directionsRenderer.setMap(null);
      
      // Show markers again when directions are removed
      activeMarkers.forEach(marker => {
        marker.setVisible(true);
      });
    };
  }, [map, directionsService, directionsRenderer, showDirections, destination, center, activeMarkers]);

  return <div ref={mapRef} className={`w-full h-full ${className}`} />;
};

export default GoogleMap; 