
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import Logo from '@/components/Logo';
import AnimatedButton from '@/components/AnimatedButton';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/location-setup');
  };

  return (
    <GradientBackground>
      <motion.div 
        className="flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo size="lg" className="mb-6" />

        <motion.h1 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to DisasterReady
        </motion.h1>

        <motion.p 
          className="text-xl text-white/90 mb-12 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Stay prepared with personalized disaster alerts and readiness plans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AnimatedButton 
            onClick={handleGetStarted} 
            variant="gradient" 
            className="text-lg px-8 py-4"
            icon={<ArrowRight size={18} />}
          >
            Get Started
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
};

export default Welcome;
