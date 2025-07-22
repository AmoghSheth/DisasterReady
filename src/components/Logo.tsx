import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'animation';
  showText?: boolean;
}

const Logo = ({ className, size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    xxl: 'text-6xl',
    animation: 'text-6xl'
  };

  // Define responsive sizes for the logo
  const getLogoSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 sm:w-12 sm:h-12';
      case 'md':
        return 'w-16 h-16 sm:w-18 sm:h-18';
      case 'lg':
        return 'w-16 h-16 sm:w-20 sm:h-20';
      case 'xl':
        return 'w-[70vw] h-[70vw] sm:w-[60vw] sm:h-[60vw]'; // EXTREME - 70% of viewport width
      case 'xxl':
        return 'w-[80vw] h-[80vw] sm:w-[70vw] sm:h-[70vw]'; // COLOSSAL - 80% of viewport width
      case 'animation':
        return 'h-[50vh] w-[50vh] sm:w-[40vw] sm:h-[40vw]'; // 55% of viewport height, square aspect ratio
      default:
        return 'w-16 h-16';
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img 
        src="/logo.png" 
        alt="DisasterReady Logo" 
        className={cn('object-contain object-center', getLogoSizeClass())}
        style={{ imageRendering: 'crisp-edges' }}
      />
      {showText && (
        <span className={cn('font-bold', sizeClasses[size])}>
          <span className="text-disaster-blue">Disaster</span>
          <span className="text-disaster-green">Ready</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
