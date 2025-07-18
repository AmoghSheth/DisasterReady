import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import PreparednessPlanCard from '@/components/PreparednessPlanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, Info, CloudLightning, Flame } from 'lucide-react';
import { useHousehold } from '@/contexts/HouseholdContext';
import { toast } from 'sonner';
import { getWeatherByZip, getFemaDisastersByState } from '@/utils/externalData';

interface PlanItem {
  id: string;
  title: string;
  baseQuantity: number;
  quantity?: number;
}

interface Plan {
  [key: string]: PlanItem[];
}

const basePlans: Plan = {
  earthquake: [
    { id: 'eq1', title: 'Secure heavy furniture to walls', baseQuantity: 1 },
    { id: 'eq2', title: 'Identify safe spots in each room', baseQuantity: 1 },
    { id: 'eq3', title: 'Prepare emergency kit with food and water', baseQuantity: 1 },
    { id: 'eq4', title: 'Learn how to shut off gas and water', baseQuantity: 1 },
    { id: 'eq5', title: 'Practice drop, cover, and hold drills', baseQuantity: 1 },
  ],
  flood: [
    { id: 'fl1', title: 'Know your property\'s flood risk level', baseQuantity: 1 },
    { id: 'fl2', title: 'Prepare sandbags or barriers', baseQuantity: 10 },
    { id: 'fl3', title: 'Create evacuation plan with multiple routes', baseQuantity: 1 },
    { id: 'fl4', title: 'Move valuables to higher floors', baseQuantity: 1 },
  ],
  wildfire: [
    { id: 'wf1', title: 'Create defensible space around home', baseQuantity: 1 },
    { id: 'wf2', title: 'Use fire-resistant materials', baseQuantity: 1 },
    { id: 'wf3', title: 'Prepare go-bag with essentials', baseQuantity: 1 },
    { id: 'wf4', title: 'Plan multiple evacuation routes', baseQuantity: 1 },
  ],
  hurricane: [
    { id: 'hu1', title: 'Know evacuation zone and routes', baseQuantity: 1 },
    { id: 'hu2', title: 'Install storm shutters', baseQuantity: 1 },
    { id: 'hu3', title: 'Trim trees and branches near home', baseQuantity: 1 },
    { id: 'hu4', title: 'Secure outdoor items before storm', baseQuantity: 1 },
  ]
};

const Plan = () => {
  const { household, updateSupply } = useHousehold();
  const [plans, setPlans] = useState<Plan>(basePlans);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('earthquake');
  
  useEffect(() => {
    const fetchAlertsAndData = async () => {
      const zip = localStorage.getItem('userZipCode');
      if (!zip) return;
      try {
        const weatherData = await getWeatherByZip(zip);
        setWeatherAlerts(weatherData.alerts || []);
        if (weatherData.geo && weatherData.geo.state) {
          const fema = await getFemaDisastersByState(weatherData.geo.state);
          setFemaDisasters(fema);
        }

        // Dynamic Notifications
        if (weatherData.alerts && weatherData.alerts.length > 0) {
          const highSeverityAlert = weatherData.alerts.find(a => a.severity?.toLowerCase() === 'high' || a.event.includes('Warning'));
          if (highSeverityAlert) {
            toast.warning(`High Alert: ${highSeverityAlert.event}`, {
              description: "Check your preparedness plan for recommended actions.",
              duration: 8000,
            });
          }
        }
      } catch (e) {
        setWeatherAlerts([]);
        setFemaDisasters([]);
      }
    };
    fetchAlertsAndData();
  }, []);
  
  useEffect(() => {
    const customizedPlans = { ...basePlans };
    
    Object.keys(customizedPlans).forEach(disasterType => {
      customizedPlans[disasterType] = customizedPlans[disasterType].map(item => ({
        ...item,
        quantity: item.baseQuantity * household.size
      }));
    });
    
    if (household.pets.length > 0) {
      const petKit = { id: 'petkit', title: `Prepare emergency kit for ${household.pets.join(', ')}`, baseQuantity: 1, quantity: 1 };
      Object.keys(customizedPlans).forEach(disasterType => {
        customizedPlans[disasterType].push(petKit);
      });
    }
    
    if (household.medicalNeeds.length > 0) {
      const medicalKit = { id: 'medkit', title: 'Prepare 7-day supply of essential medications', baseQuantity: 1, quantity: 1 };
      Object.keys(customizedPlans).forEach(disasterType => {
        customizedPlans[disasterType].push(medicalKit);
      });
    }
    
    setPlans(customizedPlans);
  }, [household]);
  
  const toggleItemCompletion = (disasterType: keyof typeof plans, itemId: string) => {
    const item = plans[disasterType].find(item => item.id === itemId);
    if (item) {
      const currentStatus = household.supplies[itemId]?.completed || false;
      const quantity = item.quantity || item.baseQuantity;
      updateSupply(itemId, quantity, !currentStatus);
      toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as complete');
    }
  };
  
  const calculateProgress = (disasterType: keyof typeof plans) => {
    const totalItems = plans[disasterType].length;
    if (totalItems === 0) return 0;
    
    const completedItems = plans[disasterType].filter(item => 
      household.supplies[item.id]?.completed
    ).length;
    
    return (completedItems / totalItems) * 100;
  };

  const getHighlightedItems = () => {
    const highlightIds: string[] = [];
    if (weatherAlerts.some(a => /flood/i.test(a.event))) {
      highlightIds.push('fl2', 'fl3', 'fl4');
    }
    if (weatherAlerts.some(a => /storm|tornado|hurricane/i.test(a.event))) {
      highlightIds.push('hu1', 'hu2', 'hu4');
    }
    if (weatherAlerts.some(a => /fire|wildfire/i.test(a.event))) {
      highlightIds.push('wf1', 'wf3', 'wf4');
    }
    if (weatherAlerts.some(a => /earthquake/i.test(a.event))) {
      highlightIds.push('eq2', 'eq5');
    }
    return highlightIds;
  };

  const highlightedItems = getHighlightedItems();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Your Preparedness Plan</h1>
        <p className="text-sm text-gray-500 mt-1">Tailored steps to stay disaster-ready</p>
      </motion.div>
      
      {(weatherAlerts.length > 0 || femaDisasters.length > 0) && (
        <motion.div
          className="mx-5 my-4 p-4 bg-gradient-to-br from-yellow-50 to-red-50 border-l-4 border-red-400 rounded-xl shadow flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-red-500" />
            <span className="font-semibold text-red-700 text-lg">Active Alerts & Disasters</span>
          </div>
          {weatherAlerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <CloudLightning className="text-yellow-500 mt-1" />
              <div>
                <div className="font-medium text-gray-800">{alert.event}</div>
                <div className="text-xs text-gray-600">{alert.description}</div>
              </div>
            </div>
          ))}
          {femaDisasters.map((dis, i) => (
            <div key={i} className="flex items-start gap-2">
              <Flame className="text-orange-500 mt-1" />
              <div>
                <div className="font-medium text-gray-800">{dis.incidentType} ({dis.declarationTitle})</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
      
      <div className="px-5 py-4">
        <Tabs defaultValue="earthquake" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4 grid grid-cols-4">
            <TabsTrigger value="earthquake">Earthquake</TabsTrigger>
            <TabsTrigger value="flood">Flood</TabsTrigger>
            <TabsTrigger value="wildfire">Wildfire</TabsTrigger>
            <TabsTrigger value="hurricane">Hurricane</TabsTrigger>
          </TabsList>
          
          {(Object.keys(plans) as Array<keyof typeof plans>).map(disasterType => (
            <TabsContent key={disasterType} value={disasterType} className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-500">
                      {plans[disasterType].filter(item => household.supplies[item.id]?.completed).length} / {plans[disasterType].length} complete
                    </span>
                  </div>
                  <Progress value={calculateProgress(disasterType)} className="h-2" />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-500">RECOMMENDED ACTIONS</h2>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  {plans[disasterType].map((item) => (
                    <PreparednessPlanCard
                      key={item.id}
                      title={item.title}
                      isCompleted={household.supplies[item.id]?.completed || false}
                      onClick={() => toggleItemCompletion(disasterType, item.id)}
                      quantity={item.quantity}
                      highlight={highlightedItems.includes(item.id)}
                    />
                  ))}
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
                  <h2 className="font-medium mb-2">Downloadable Supply List</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your household size ({household.size} people) and needs.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    asChild
                  >
                    <a href="/emergency-checklist.png" download="emergency-checklist.png">
                      <Download size={16} />
                      Download Supply List
                    </a>
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Plan;
