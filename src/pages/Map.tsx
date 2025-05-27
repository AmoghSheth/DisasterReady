import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          
          <TabsContent value="shelters" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">NEARBY SHELTERS</h2>
              
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
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-9"
                      onClick={() => handleGetDirections(markers[index].position)}
                    >
                      <Navigation size={16} className="mr-2" /> Directions
                    </Button>
                  </div>
                </div>
              ))}
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
                  onClick={updateCurrentLocation}
                  disabled={location.isLoading}
                >
                  {location.isLoading ? "Updating Location..." : "Update Current Location"}
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
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9"
                      onClick={() => handleGetDirections(markers[index].position)}
                    >
                      <Navigation size={16} className="mr-2" /> Directions
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Map;
