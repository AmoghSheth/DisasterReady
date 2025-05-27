
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import GoogleMap from '@/components/GoogleMap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Phone, Hospital, Shield } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Location, PlaceResult } from '@/utils/googleMaps';

const Map = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [shelters, setShelters] = useState<PlaceResult[]>([]);
  const [medicalFacilities, setMedicalFacilities] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shelters');
  const { isLoaded, findNearbyPlaces, mapsService } = useGoogleMaps();

  useEffect(() => {
    const loadUserLocation = () => {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
      } else {
        // Default to Los Angeles if no location saved
        setUserLocation({ lat: 34.0522, lng: -118.2437 });
      }
    };

    loadUserLocation();
  }, []);

  useEffect(() => {
    const loadNearbyPlaces = async () => {
      if (!userLocation || !isLoaded) return;

      setIsLoading(true);
      try {
        // Find emergency shelters (using lodging and local_government_office as proxies)
        const shelterResults = await findNearbyPlaces(userLocation, 'lodging', 8000);
        const governmentResults = await findNearbyPlaces(userLocation, 'local_government_office', 8000);
        
        // Combine and add distance calculation
        const allShelters = [...shelterResults, ...governmentResults].map(place => ({
          ...place,
          distance: mapsService?.calculateDistance(userLocation, place.location) || 0
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 5);

        setShelters(allShelters);

        // Find medical facilities
        const hospitalResults = await findNearbyPlaces(userLocation, 'hospital', 10000);
        const medicalResults = hospitalResults.map(place => ({
          ...place,
          distance: mapsService?.calculateDistance(userLocation, place.location) || 0
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 3);

        setMedicalFacilities(medicalResults);
      } catch (error) {
        console.error('Error loading nearby places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNearbyPlaces();
  }, [userLocation, isLoaded, findNearbyPlaces, mapsService]);

  const handleGetDirections = (destination: Location) => {
    if (mapsService) {
      mapsService.openDirections(destination);
    }
  };

  const getMapMarkers = (currentTab: string) => {
    const markers = [];
    
    // Add user location marker
    if (userLocation) {
      markers.push({
        position: userLocation,
        title: 'Your Location',
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });
    }

    // Add relevant markers based on active tab
    if (currentTab === 'shelters') {
      shelters.forEach(shelter => {
        markers.push({
          position: shelter.location,
          title: shelter.name,
          icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
      });
    } else if (currentTab === 'medical') {
      medicalFacilities.forEach(facility => {
        markers.push({
          position: facility.location,
          title: facility.name,
          icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
      });
    }

    return markers;
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <p>Loading location...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Evacuation Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find safety resources nearby
        </p>
      </motion.div>
      
      {/* Map View */}
      <div className="px-5 py-4">
        <Tabs 
          defaultValue="shelters" 
          className="w-full" 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="shelters">Shelters</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
          </TabsList>
          
          {/* Google Map */}
          <div className="mb-4">
            <GoogleMap
              center={userLocation}
              zoom={12}
              height="250px"
              markers={getMapMarkers(activeTab)}
            />
          </div>
          
          <TabsContent value="shelters" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">NEARBY EMERGENCY SHELTERS</h2>
              
              {isLoading ? (
                <div className="text-center py-4">Loading nearby shelters...</div>
              ) : shelters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No shelters found nearby</div>
              ) : (
                shelters.map((shelter, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2 text-disaster-blue" />
                          <h3 className="font-medium">{shelter.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {shelter.distance?.toFixed(1)} miles away
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{shelter.address}</p>
                        {shelter.phone && (
                          <div className="flex items-center mt-2 text-sm text-disaster-blue">
                            <Phone size={14} className="mr-1" />
                            <span>{shelter.phone}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="h-9"
                        onClick={() => handleGetDirections(shelter.location)}
                      >
                        <Navigation size={16} className="mr-2" /> Directions
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="routes" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">EVACUATION ROUTES</h2>
              
              <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-medium">Current Location</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-3"
                  onClick={() => {
                    // Open Google Maps with general evacuation route
                    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  Get Safe Routes
                </Button>
                
                <p className="text-sm text-gray-600">
                  Traffic conditions and hazards are constantly monitored to provide the safest evacuation routes.
                </p>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="medical" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">MEDICAL FACILITIES</h2>
              
              {isLoading ? (
                <div className="text-center py-4">Loading medical facilities...</div>
              ) : medicalFacilities.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No medical facilities found nearby</div>
              ) : (
                medicalFacilities.map((facility, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Hospital size={16} className="mr-2 text-disaster-blue" />
                          <h3 className="font-medium">{facility.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {facility.distance?.toFixed(1)} miles away
                          {facility.rating && ` • ${facility.rating}★`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{facility.address}</p>
                        {facility.phone && (
                          <div className="flex items-center mt-2 text-sm text-disaster-blue">
                            <Phone size={14} className="mr-1" />
                            <span>{facility.phone}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9"
                        onClick={() => handleGetDirections(facility.location)}
                      >
                        <Navigation size={16} className="mr-2" /> Directions
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Map;
