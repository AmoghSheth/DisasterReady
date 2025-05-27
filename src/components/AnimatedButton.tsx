import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
}

const AnimatedButton = ({ 
  children, 
  onClick, 
  className, 
  icon,
  variant = 'default',
  disabled = false
}: AnimatedButtonProps) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'gradient':
        return 'gradient-button relative overflow-hidden';
      default:
        return 'relative overflow-hidden';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn("relative", disabled && "opacity-70")}
    >
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md -z-10"></div>
      )}
      <Button 
        onClick={onClick} 
        className={cn(getButtonClass(), className)}
        variant={variant !== 'gradient' ? variant : 'default'}
        disabled={disabled}
      >
        {variant === 'gradient' && (
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-400 opacity-80 rounded-full" />
        )}
        <span className="relative flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </span>
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
