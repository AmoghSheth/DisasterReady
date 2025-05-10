
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

const GradientBackground = ({ className, children }: GradientBackgroundProps) => {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 flex flex-col items-center justify-center p-6',
      className
    )}>
      {children}
    </div>
  );
};

export default GradientBackground;
