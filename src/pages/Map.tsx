
import React from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Phone, Hospital, Home } from 'lucide-react';

const Map = () => {
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
        <p className="text-sm text-gray-500 mt-1">Find safety resources nearby</p>
      </motion.div>
      
      {/* Map View */}
      <div className="px-5 py-4">
        <Tabs defaultValue="shelters" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="shelters">Shelters</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
          </TabsList>
          
          {/* Map Container - Would be replaced with actual map component */}
          <div className="bg-gray-200 rounded-xl w-full h-64 mb-4 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="w-10 h-10 mx-auto mb-2" />
              <p>Map view would be displayed here</p>
              <p className="text-sm">Showing nearby emergency resources</p>
            </div>
          </div>
          
          <TabsContent value="shelters" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">NEARBY SHELTERS</h2>
              
              {/* Shelter Cards */}
              {[1, 2, 3].map(index => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">Community Center #{index}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {(index * 0.7).toFixed(1)} miles away • Capacity: {index * 50} people
                      </p>
                      <div className="flex items-center mt-2 text-sm text-disaster-blue">
                        <Phone size={14} className="mr-1" />
                        <span>(555) 123-{4567 + index}</span>
                      </div>
                    </div>
                    <Button size="sm" className="h-9">
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
                    <p className="font-medium">Current Location</p>
                  </div>
                </div>
                
                <Button className="w-full mb-3">Get Safe Routes</Button>
                
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
              {[1, 2].map(index => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <Hospital size={16} className="mr-2 text-disaster-blue" />
                        <h3 className="font-medium">
                          {index === 1 ? 'General Hospital' : 'Urgent Care Center'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {(index * 1.2).toFixed(1)} miles away • Open 24/7
                      </p>
                      <div className="flex items-center mt-2 text-sm text-disaster-blue">
                        <Phone size={14} className="mr-1" />
                        <span>(555) 987-{6543 + index}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-9">
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
