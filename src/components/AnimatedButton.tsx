
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'secondary' | 'destructive' | 'outline';
}

const AnimatedButton = ({ 
  children, 
  onClick, 
  className, 
  icon,
  variant = 'default'
}: AnimatedButtonProps) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'gradient':
        return 'gradient-button transform transition-all duration-300 hover:scale-105 active:scale-95';
      default:
        return 'transform transition-all duration-300 hover:scale-105 active:scale-95';
    }
  };

  return (
    <Button 
      onClick={onClick} 
      className={cn(getButtonClass(), className)}
      variant={variant !== 'gradient' ? variant : 'default'}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};

export default AnimatedButton;
