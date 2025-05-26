import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '@/components/GradientBackground';
import Logo from '@/components/Logo';
import AnimatedButton from '@/components/AnimatedButton';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);

  useEffect(() => {
    // Start content animation after logo animation
    const timer = setTimeout(() => {
      setLogoAnimationComplete(true);
      
      // Delay the full content appearance after logo animation completes
      setTimeout(() => {
        setAnimationComplete(true);
      }, 800);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/location-setup');
  };

  // Enhanced animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 100 
      }
    }
  };

  return (
    <GradientBackground>
      {/* Full-screen container with centered content */}
      <div className="min-h-screen w-full flex flex-col items-center justify-between py-6 px-3">
        {/* Initial Logo Animation - Centered in the screen */}
        <AnimatePresence>
          {!logoAnimationComplete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                scale: 1.5, 
                y: -100,
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -10 }}
                animate={{ 
                  scale: 1.5, 
                  opacity: 1, 
                  rotate: 0,
                  transition: {
                    scale: { type: "spring", stiffness: 100, damping: 10 },
                    opacity: { duration: 0.8 },
                    rotate: { duration: 1, ease: "easeOut" }
                  }
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                <Logo size="xxl" showText={false} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content - Enhanced animations with extreme logo size */}
        <motion.div 
          className="flex flex-col items-center justify-between h-full w-full"
          variants={containerVariants}
          initial="hidden"
          animate={animationComplete ? "visible" : "hidden"}
          style={{ gap: '1vh' }}
        >
          {/* COLOSSAL Logo */}
          <motion.div
            variants={itemVariants}
            className="mt-[2vh]"
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <Logo size="xl" showText={false} />
          </motion.div>

          {/* Text content - moved closer to the logo */}
          <motion.div 
            className="flex flex-col items-center text-center w-full mt-0" 
            style={{ gap: '1vh' }}
          >
            <motion.h1 
              className="text-5xl sm:text-7xl font-bold text-white drop-shadow-md w-full"
              variants={itemVariants}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={animationComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="block"
              >
                Welcome to
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={animationComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block"
              >
                DisasterReady
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl sm:text-3xl text-white/90 w-[95%] drop-shadow-sm"
              variants={itemVariants}
              initial={{ opacity: 0, y: 30 }}
              animate={animationComplete ? { 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: 0.8,
                  duration: 0.8,
                  ease: "easeOut"
                }
              } : { opacity: 0, y: 30 }}
            >
              Stay prepared with personalized disaster alerts and readiness plans.
            </motion.p>
          </motion.div>

          {/* Button - with enhanced animations */}
          <motion.div
            className="relative w-[95%] mb-[4vh] mt-[3vh]"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={animationComplete ? { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { 
                delay: 1.1,
                duration: 0.7, 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }
            } : { opacity: 0, y: 50, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="absolute inset-0 bg-white/10 rounded-full blur-lg -z-10"
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <AnimatedButton 
              onClick={handleGetStarted} 
              variant="gradient" 
              className="text-2xl sm:text-3xl px-12 py-6 sm:py-7 font-medium rounded-full shadow-lg w-full"
              icon={<ArrowRight size={28} className="sm:w-8 sm:h-8" />}
            >
              Get Started
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default Welcome;
