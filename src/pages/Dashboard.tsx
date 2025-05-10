
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import { Bell, MapPin, ArrowRight } from 'lucide-react';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import AlertCard from '@/components/AlertCard';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

// Mock data
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
];

const mockRiskData = [
  { date: 'Mon', risk: 20 },
  { date: 'Tue', risk: 30 },
  { date: 'Wed', risk: 45 },
  { date: 'Thu', risk: 60 },
  { date: 'Fri', risk: 40 },
  { date: 'Sat', risk: 25 },
  { date: 'Sun', risk: 15 },
];

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk < 30) return '#34C759';
    if (risk < 50) return '#FFCC00';
    return '#FF3B30';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Logo size="sm" />
          <p className="text-sm text-gray-500 mt-1">
            {format(currentTime, 'EEEE, MMMM d • h:mm a')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-disaster-red rounded-full"></span>
          </Button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="px-5 py-4">
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <MapPin size={18} className="text-gray-500 mr-1" />
          <span className="text-sm text-gray-500">Los Angeles, CA</span>
        </motion.div>
        
        {/* Risk Level Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="font-semibold mb-4">Current Risk Level</h2>
          <RiskLevelBadge level="medium" type="storm" />
          <p className="mt-3 text-sm text-gray-600">
            A storm system is approaching your area with potential for heavy rainfall and high winds.
          </p>
        </motion.div>
        
        {/* Live Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Live Alerts</h2>
            <Button variant="ghost" size="sm" className="text-disaster-blue flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          
          {mockAlerts.map(alert => (
            <AlertCard key={alert.id} {...alert} />
          ))}
        </motion.div>
        
        {/* Risk Forecast */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <h2 className="font-semibold mb-4">7-Day Risk Forecast</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRiskData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis hide domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  formatter={(value) => {
                    const riskValue = Number(value);
                    let status = "Low";
                    if (riskValue >= 50) status = "High";
                    else if (riskValue >= 30) status = "Medium";
                    return [`${status} (${riskValue}%)`, "Risk Level"];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#34C759" 
                  fillOpacity={1} 
                  fill="url(#riskGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Map Preview */}
        <motion.div 
          className="mt-6 rounded-xl overflow-hidden shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="bg-gray-200 h-48 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">Map preview showing nearby shelters</p>
            </div>
          </div>
          <div className="bg-white p-4">
            <h3 className="font-medium">Nearby Emergency Resources</h3>
            <p className="text-sm text-gray-600 mt-1">
              3 shelters and 2 medical centers within 5 miles
            </p>
            <Button className="w-full mt-3" variant="outline">View Map</Button>
          </div>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
