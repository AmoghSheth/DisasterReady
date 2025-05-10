
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ className, size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Shield className="text-disaster-blue" size={iconSizes[size]} />
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
