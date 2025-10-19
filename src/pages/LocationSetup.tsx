
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import AnimatedButton from '@/components/AnimatedButton';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useAuth } from '@/contexts/AuthContext';

type LocationCoords = {
  lat: number;
  lng: number;
};

const LocationSetup = () => {
  const [zipCode, setZipCode] = useState('');
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const navigate = useNavigate();
  const { getCurrentLocation } = useGoogleMaps();
  const { updateUserProfile } = useAuth();

  const handleUseGPS = async () => {
    setIsDetecting(true);
    try {
      const capturedLocation = await getCurrentLocation();
      if (capturedLocation) {
        setLocation(capturedLocation);
        toast.success("Location detected successfully!");
      } else {
        toast.error("Unable to detect location. Please check your browser permissions.");
      }
    } catch (error) {
      console.error('GPS location error:', error);
      toast.error("Location detection failed. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleContinue = async () => {
    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code.");
      return;
    }
    if (!location) {
      toast.error("Please use the 'Use Current Location' button to capture your coordinates.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await updateUserProfile({
        zip_code: zipCode,
        location: location,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save location');
      }
      
      toast.success("Location saved successfully!");
      navigate('/household-setup');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(`Failed to save location: ${errorMessage}`);
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
          Where are you located?
        </motion.h1>
        
        <motion.p 
          className="text-gray-600 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We need both your ZIP code and current location for accurate alerts.
        </motion.p>
        
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
              1. Enter Your ZIP Code
            </label>
            <Input 
              id="zipcode"
              type="text" 
              placeholder="Enter your 5-digit ZIP code" 
              maxLength={5}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              2. Get Your Current Location
            </label>
            <button 
              onClick={handleUseGPS}
              className={`flex items-center justify-center w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                location
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              disabled={isDetecting || isProcessing}
            >
              {location ? (
                <CheckCircle className="mr-2" size={18} />
              ) : (
                <MapPin className="mr-2" size={18} />
              )}
              {isDetecting ? "Detecting..." : location ? "Location Captured!" : "Use Current Location"}
            </button>
          </div>
          
          <div className="pt-4">
            <AnimatedButton 
              onClick={handleContinue} 
              className="w-full"
              icon={<ArrowRight size={18} />}
              disabled={!zipCode || !location || isProcessing}
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
