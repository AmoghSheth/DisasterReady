<<<<<<< HEAD
=======

>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import GoogleMap from '@/components/GoogleMap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
<<<<<<< HEAD
import { MapPin, Navigation, Phone, Hospital, Home } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';
import { useLocation } from '@/contexts/LocationContext';
import { toast } from 'sonner';

// Shelter data with details
const shelterData = [
  {
    title: 'Community Center #1',
    description: 'Emergency shelter with capacity for 50 people. Provides food, water, and basic medical supplies.',
    capacity: 50,
    phone: '(555) 123-4567',
    distance: 0.7,
  },
  {
    title: 'Community Center #2',
    description: 'Large shelter with capacity for 100 people. Includes shower facilities and pet accommodations.',
    capacity: 100,
    phone: '(555) 123-4568',
    distance: 1.4,
  },
  {
    title: 'Community Center #3',
    description: 'Small shelter with capacity for 30 people. Generator backup power and satellite communication.',
    capacity: 30,
    phone: '(555) 123-4569',
    distance: 2.1,
  },
];

// Medical facility data with details
const medicalData = [
  {
    title: 'General Hospital',
    description: 'Full-service hospital with 24/7 emergency department. Trauma center level II.',
    hours: '24/7',
    phone: '(555) 987-6543',
    distance: 1.2,
  },
  {
    title: 'Urgent Care Center',
    description: 'Walk-in clinic for non-emergency medical needs. Has basic emergency supplies.',
    hours: '8am-10pm',
    phone: '(555) 987-6544',
    distance: 2.4,
  },
];

const Map = () => {
  const { location, getCurrentLocation } = useLocation();
  const [currentCoords, setCurrentCoords] = useState({ lat: 37.7749, lng: -122.4194 }); // Default SF
  const [selectedDestination, setSelectedDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [activeTab, setActiveTab] = useState('shelters');
  const [mapHeight, setMapHeight] = useState('16rem'); // Default height

  // Update coordinates when location changes
  useEffect(() => {
    if (location.coords) {
      setCurrentCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    }
  }, [location.coords]);

  // Generate markers based on current location and active tab
  const generateMarkers = () => {
    if (activeTab === 'shelters') {
      return shelterData.map((shelter, index) => ({
        position: {
          lat: currentCoords.lat + (0.01 * (index + 1) * Math.cos(index * Math.PI / 3)),
          lng: currentCoords.lng + (0.01 * (index + 1) * Math.sin(index * Math.PI / 3))
        },
        title: shelter.title,
        description: shelter.description,
        category: 'shelter' as const
      }));
    } else if (activeTab === 'medical') {
      return medicalData.map((facility, index) => ({
        position: {
          lat: currentCoords.lat + (0.015 * (index + 1) * Math.sin(index * Math.PI / 2)), 
          lng: currentCoords.lng + (0.015 * (index + 1) * Math.cos(index * Math.PI / 2))
        },
        title: facility.title,
        description: facility.description,
        category: 'medical' as const
      }));
    }
    return [];
  };

  // Get user's current location
  const updateCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      toast.success("Location updated successfully");
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  // Handle getting directions to a location
  const handleGetDirections = (destination: { lat: number; lng: number }) => {
    setSelectedDestination(destination);
    setShowDirections(true);
  };

  // Handle tab change to load appropriate markers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowDirections(false);
    setSelectedDestination(null);
    
    // Expand map when viewing routes
    setMapHeight(value === 'routes' ? '24rem' : '16rem');
  };

  // Get markers for the selected tab
  const markers = generateMarkers();
=======
import { MapPin, Navigation, Phone, Hospital, Home, Shield } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Location, PlaceResult } from '@/utils/googleMaps';

const Map = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [shelters, setShelters] = useState<PlaceResult[]>([]);
  const [medicalFacilities, setMedicalFacilities] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const getMapMarkers = (activeTab: string) => {
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
    if (activeTab === 'shelters') {
      shelters.forEach(shelter => {
        markers.push({
          position: shelter.location,
          title: shelter.name,
          icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
      });
    } else if (activeTab === 'medical') {
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
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8

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
          {location.city && location.state ? `${location.city}, ${location.state}` : 'Find safety resources nearby'}
        </p>
      </motion.div>
      
      {/* Map View */}
      <div className="px-5 py-4">
        <Tabs defaultValue="shelters" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="shelters">Shelters</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
          </TabsList>
          
<<<<<<< HEAD
          {/* Google Maps Component */}
          <motion.div 
            className="rounded-xl w-full overflow-hidden mb-4"
            animate={{ height: mapHeight }}
            transition={{ duration: 0.3 }}
          >
            <GoogleMap 
              center={currentCoords}
              markers={markers}
              showDirections={showDirections}
              destination={selectedDestination || undefined}
              className="rounded-xl"
              zoom={13}
              highlightCurrentLocation={true}
            />
          </motion.div>
=======
          {/* Google Map */}
          <div className="mb-4">
            <GoogleMap
              center={userLocation}
              zoom={12}
              height="250px"
              markers={getMapMarkers('shelters')}
            />
          </div>
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
          
          <TabsContent value="shelters" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">NEARBY EMERGENCY SHELTERS</h2>
              
<<<<<<< HEAD
              {/* Shelter Cards */}
              {shelterData.map((shelter, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{shelter.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {shelter.distance.toFixed(1)} miles away • Capacity: {shelter.capacity} people
                      </p>
                      <div className="flex items-center mt-2 text-sm text-disaster-blue">
                        <Phone size={14} className="mr-1" />
                        <span>{shelter.phone}</span>
=======
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
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
                      </div>
                      <Button 
                        size="sm" 
                        className="h-9"
                        onClick={() => handleGetDirections(shelter.location)}
                      >
                        <Navigation size={16} className="mr-2" /> Directions
                      </Button>
                    </div>
<<<<<<< HEAD
                    <Button 
                      size="sm" 
                      className="h-9"
                      onClick={() => handleGetDirections(markers[index].position)}
                    >
                      <Navigation size={16} className="mr-2" /> Directions
                    </Button>
=======
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
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
                    <Home size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-medium">
                      {location.address ? location.address.split(',')[0] : 'Current Location'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-3"
<<<<<<< HEAD
                  onClick={updateCurrentLocation}
                  disabled={location.isLoading}
                >
                  {location.isLoading ? "Updating Location..." : "Update Current Location"}
=======
                  onClick={() => {
                    // Open Google Maps with general evacuation route
                    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  Get Safe Routes
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
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
              
<<<<<<< HEAD
              {/* Medical Facility Cards */}
              {medicalData.map((facility, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <Hospital size={16} className="mr-2 text-disaster-blue" />
                        <h3 className="font-medium">{facility.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {facility.distance.toFixed(1)} miles away • Open {facility.hours}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-disaster-blue">
                        <Phone size={14} className="mr-1" />
                        <span>{facility.phone}</span>
=======
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
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
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
<<<<<<< HEAD
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9"
                      onClick={() => handleGetDirections(markers[index].position)}
                    >
                      <Navigation size={16} className="mr-2" /> Directions
                    </Button>
=======
>>>>>>> 98bb49f12a4d6c9fb2e3da536eb49a5ab4495ed8
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
