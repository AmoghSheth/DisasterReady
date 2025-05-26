import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

const GradientBackground = ({ className, children }: GradientBackgroundProps) => {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-teal-400 overflow-hidden relative flex flex-col items-center justify-center p-6',
      className
    )}>
      {/* Animated gradient circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/4 -right-40 w-96 h-96 bg-teal-300 rounded-full opacity-20 blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 18,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Content with z-index to appear above the background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
