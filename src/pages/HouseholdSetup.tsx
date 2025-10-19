import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import AnimatedButton from '@/components/AnimatedButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dog, Cat, Check, Users, Heart, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

const HouseholdSetup = () => {
  const [householdSize, setHouseholdSize] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState<string[]>([]);
  const [pets, setPets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const medicalNeedOptions = [
    { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
    { id: 'devices', label: 'Assistive Devices', icon: <Heart className="w-4 h-4" /> },
    { id: 'mobility', label: 'Mobility Needs', icon: <Heart className="w-4 h-4" /> },
    { id: 'oxygen', label: 'Oxygen', icon: <Heart className="w-4 h-4" /> },
    { id: 'allergies', label: 'Severe Allergies', icon: <Heart className="w-4 h-4" /> },
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

  const handleFinish = async () => {
    if (!householdSize) {
      toast.error("Please select your household size");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await updateUserProfile({
        household_size: parseInt(householdSize),
        pets: pets,
        medical_needs: medicalNeeds,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save household info');
      }

      toast.success("Setup complete! Welcome to your dashboard.");
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(`Failed to save household info: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
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
            <label htmlFor="household-size" className="block text-sm font-medium text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Household Size
            </label>
            <Select value={householdSize} onValueChange={setHouseholdSize} disabled={isProcessing}>
              <SelectTrigger id="household-size" className="w-full">
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
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => togglePet('dog')}
                disabled={isProcessing}
                className={`p-4 rounded-lg flex items-center justify-center transition-all ${
                  pets.includes('dog') 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Dog className="mr-2" size={20} />
                Dog
              </button>
              
              <button
                onClick={() => togglePet('cat')}
                disabled={isProcessing}
                className={`p-4 rounded-lg flex items-center justify-center transition-all ${
                  pets.includes('cat') 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm' 
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
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
            <div className="grid grid-cols-1 gap-2">
              {medicalNeedOptions.map((need) => (
                <div 
                  key={need.id} 
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    medicalNeeds.includes(need.id)
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <Checkbox
                    id={need.id}
                    checked={medicalNeeds.includes(need.id)}
                    onCheckedChange={() => toggleMedicalNeed(need.id)}
                    disabled={isProcessing}
                    className="mr-3"
                  />
                  <Label 
                    htmlFor={need.id} 
                    className={`flex items-center cursor-pointer ${
                      medicalNeeds.includes(need.id) ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {need.icon}
                    <span className="ml-2">{need.label}</span>
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
              disabled={isProcessing}
            >
              {isProcessing ? 'Saving...' : 'Finish Setup'}
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
};

export default HouseholdSetup;
