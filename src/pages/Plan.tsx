
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import PreparednessPlanCard from '@/components/PreparednessPlanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data for different preparedness plans
const mockPlans = {
  earthquake: [
    { id: 'eq1', title: 'Secure heavy furniture to walls', completed: true },
    { id: 'eq2', title: 'Identify safe spots in each room', completed: true },
    { id: 'eq3', title: 'Prepare emergency kit with food and water', completed: false },
    { id: 'eq4', title: 'Learn how to shut off gas and water', completed: false },
    { id: 'eq5', title: 'Practice drop, cover, and hold drills', completed: false },
    { id: 'eq6', title: 'Have emergency contact plan', completed: true }
  ],
  flood: [
    { id: 'fl1', title: 'Know your property\'s flood risk level', completed: true },
    { id: 'fl2', title: 'Prepare sandbags or barriers', completed: false },
    { id: 'fl3', title: 'Create evacuation plan with multiple routes', completed: false },
    { id: 'fl4', title: 'Move valuables to higher floors', completed: true },
    { id: 'fl5', title: 'Get flood insurance', completed: false }
  ],
  wildfire: [
    { id: 'wf1', title: 'Create defensible space around home', completed: false },
    { id: 'wf2', title: 'Use fire-resistant materials', completed: false },
    { id: 'wf3', title: 'Prepare go-bag with essentials', completed: true },
    { id: 'wf4', title: 'Plan multiple evacuation routes', completed: true },
    { id: 'wf5', title: 'Install smoke alarms', completed: true }
  ],
  hurricane: [
    { id: 'hu1', title: 'Know evacuation zone and routes', completed: false },
    { id: 'hu2', title: 'Install storm shutters', completed: false },
    { id: 'hu3', title: 'Trim trees and branches near home', completed: true },
    { id: 'hu4', title: 'Secure outdoor items before storm', completed: false },
    { id: 'hu5', title: 'Stock up on non-perishable food', completed: true }
  ]
};

const Plan = () => {
  const [plans, setPlans] = useState(mockPlans);
  
  const toggleItemCompletion = (disasterType: keyof typeof plans, itemId: string) => {
    setPlans(prevPlans => {
      // Create a deep copy of the plans
      const updatedPlans = JSON.parse(JSON.stringify(prevPlans));
      
      // Find the item and toggle its completion status
      const item = updatedPlans[disasterType].find((item: any) => item.id === itemId);
      if (item) {
        item.completed = !item.completed;
      }
      
      return updatedPlans;
    });
  };
  
  const calculateProgress = (disasterType: keyof typeof plans) => {
    const totalItems = plans[disasterType].length;
    if (totalItems === 0) return 0;
    
    const completedItems = plans[disasterType].filter((item: any) => item.completed).length;
    return (completedItems / totalItems) * 100;
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
        <h1 className="text-2xl font-bold">Your Preparedness Plan</h1>
        <p className="text-sm text-gray-500 mt-1">Tailored steps to stay disaster-ready</p>
      </motion.div>
      
      {/* Tabs */}
      <div className="px-5 py-4">
        <Tabs defaultValue="earthquake" className="w-full">
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
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-500">
                      {plans[disasterType].filter((item: any) => item.completed).length} / {plans[disasterType].length} complete
                    </span>
                  </div>
                  <Progress value={calculateProgress(disasterType)} className="h-2" />
                </div>
                
                {/* Checklist */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-3">RECOMMENDED ACTIONS</h2>
                  {plans[disasterType].map((item: any) => (
                    <PreparednessPlanCard
                      key={item.id}
                      title={item.title}
                      isCompleted={item.completed}
                      onClick={() => toggleItemCompletion(disasterType, item.id)}
                    />
                  ))}
                </div>
                
                {/* Supply List */}
                <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
                  <h2 className="font-medium mb-2">Recommended Supply List</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your household size and needs.
                  </p>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Download size={16} />
                    Download Supply List
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
