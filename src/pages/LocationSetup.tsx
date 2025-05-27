
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import AnimatedButton from '@/components/AnimatedButton';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

const LocationSetup = () => {
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();
  const { isLoaded, getCurrentLocation, geocodeZipCode, isLoadingLocation } = useGoogleMaps();

  const handleUseGPS = async () => {
    if (!isLoaded) {
      toast.error("Maps service is still loading. Please try again.");
      return;
    }

    try {
      const location = await getCurrentLocation();
      if (location) {
        toast.success("Location detected successfully!");
        // Store location in localStorage for other components
        localStorage.setItem('userLocation', JSON.stringify(location));
        navigate('/household-setup');
      } else {
        toast.error("Unable to detect location. Please check your browser permissions.");
      }
    } catch (error) {
      toast.error("Location detection failed. Please try entering your ZIP code instead.");
    }
  };

  const handleContinue = async () => {
    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    if (!isLoaded) {
      toast.error("Maps service is still loading. Please try again.");
      return;
    }

    try {
      const location = await geocodeZipCode(zipCode);
      if (location) {
        toast.success("Location found successfully!");
        // Store location in localStorage for other components
        localStorage.setItem('userLocation', JSON.stringify(location));
        localStorage.setItem('userZipCode', zipCode);
        navigate('/household-setup');
      } else {
        toast.error("Unable to find location for this ZIP code.");
      }
    } catch (error) {
      toast.error("Failed to geocode ZIP code. Please try again.");
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
          Where are you located?
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We'll use your location to provide relevant alerts and preparedness information.
        </motion.p>
        
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <Input 
              id="zipcode"
              type="text" 
              placeholder="Enter your ZIP code" 
              maxLength={5}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full"
            />
          </div>
          
          <div className="text-center">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleUseGPS}
            className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            disabled={isLoadingLocation || !isLoaded}
          >
            <MapPin className="mr-2" size={18} />
            {isLoadingLocation ? "Detecting Location..." : "Use Current Location"}
          </button>
          
          <div className="pt-4">
            <AnimatedButton 
              onClick={handleContinue} 
              className="w-full"
              icon={<ArrowRight size={18} />}
            >
              Continue
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
};

export default LocationSetup;
