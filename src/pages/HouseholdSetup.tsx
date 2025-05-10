
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import AnimatedButton from '@/components/AnimatedButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dog, Cat, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const HouseholdSetup = () => {
  const [householdSize, setHouseholdSize] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState<string[]>([]);
  const [pets, setPets] = useState<string[]>([]);
  const navigate = useNavigate();

  const medicalNeedOptions = [
    { id: 'medications', label: 'Medications' },
    { id: 'devices', label: 'Assistive Devices' },
    { id: 'mobility', label: 'Mobility Needs' },
    { id: 'oxygen', label: 'Oxygen' },
    { id: 'allergies', label: 'Severe Allergies' },
  ];

  const toggleMedicalNeed = (need: string) => {
    setMedicalNeeds(prevNeeds => 
      prevNeeds.includes(need)
        ? prevNeeds.filter(n => n !== need)
        : [...prevNeeds, need]
    );
  };

  const togglePet = (pet: string) => {
    setPets(prevPets => 
      prevPets.includes(pet)
        ? prevPets.filter(p => p !== pet)
        : [...prevPets, pet]
    );
  };

  const handleFinish = () => {
    if (!householdSize) {
      toast.error("Please select your household size");
      return;
    }
    
    // In a real app, we would save this data to a state manager or server
    toast.success("Setup complete!");
    navigate('/dashboard');
  };

  return (
    <GradientBackground>
      <motion.div 
        className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Tell us about your household
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          This information helps us customize your emergency preparedness plan.
        </motion.p>
        
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Household Size */}
          <div className="space-y-3">
            <label htmlFor="household-size" className="block text-sm font-medium text-gray-700">
              Household Size
            </label>
            <Select value={householdSize} onValueChange={setHouseholdSize}>
              <SelectTrigger id="household-size">
                <SelectValue placeholder="Select number of people" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Pets */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Do you have pets?
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => togglePet('dog')}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                  pets.includes('dog') 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                }`}
              >
                <Dog className="mr-2" size={20} />
                Dog
              </button>
              
              <button
                onClick={() => togglePet('cat')}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                  pets.includes('cat') 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                }`}
              >
                <Cat className="mr-2" size={20} />
                Cat
              </button>
            </div>
          </div>
          
          {/* Medical Needs */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Medical Needs (select all that apply)
            </label>
            <div className="space-y-2">
              {medicalNeedOptions.map((need) => (
                <div key={need.id} className="flex items-center">
                  <Checkbox
                    id={need.id}
                    checked={medicalNeeds.includes(need.id)}
                    onCheckedChange={() => toggleMedicalNeed(need.id)}
                  />
                  <Label htmlFor={need.id} className="ml-2 cursor-pointer">
                    {need.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <AnimatedButton 
              onClick={handleFinish} 
              className="w-full"
              icon={<Check size={18} />}
            >
              Finish Setup
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
};

export default HouseholdSetup;
