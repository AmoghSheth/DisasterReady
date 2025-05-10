
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import AlertCard from '@/components/AlertCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

// Mock data for alerts
const mockAlerts = [
  {
    id: 1,
    title: 'Tornado Watch',
    description: 'Possible tornado formation in your area. Monitor local weather updates.',
    timestamp: new Date(),
    severity: 'medium' as const,
    type: 'storm' as const,
  },
  {
    id: 2,
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall causing flood conditions. Avoid low-lying areas.',
    timestamp: new Date(Date.now() - 3600000),
    severity: 'high' as const,
    type: 'flood' as const,
  },
  {
    id: 3,
    title: 'Air Quality Alert',
    description: 'Poor air quality due to wildfire smoke. Limit outdoor activities.',
    timestamp: new Date(Date.now() - 7200000),
    severity: 'medium' as const,
    type: 'wildfire' as const,
  },
  {
    id: 4,
    title: 'Excessive Heat Warning',
    description: 'Temperatures expected to exceed 100°F. Stay hydrated and limit sun exposure.',
    timestamp: new Date(Date.now() - 86400000),
    severity: 'high' as const,
    type: 'general' as const,
  }
];

const savedMockAlerts = mockAlerts.slice(2, 4);

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter alerts based on search query
  const filteredAlerts = (alerts: typeof mockAlerts) => {
    if (!searchQuery) return alerts;
    
    return alerts.filter(alert => 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Stay informed about emergencies</p>
      </motion.div>
      
      {/* Search */}
      <div className="px-5 py-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All Alerts</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">CURRENT ALERTS</h2>
              {filteredAlerts(mockAlerts).map(alert => (
                <AlertCard key={alert.id} {...alert} />
              ))}
              
              {filteredAlerts(mockAlerts).length === 0 && (
                <p className="text-center text-gray-500 py-8">No alerts match your search</p>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">SAVED ALERTS</h2>
              {filteredAlerts(savedMockAlerts).map(alert => (
                <AlertCard key={alert.id} {...alert} />
              ))}
              
              {filteredAlerts(savedMockAlerts).length === 0 && (
                <p className="text-center text-gray-500 py-8">No saved alerts match your search</p>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Alerts;
