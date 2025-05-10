
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CloudLightning, CloudRain, Tornado } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';
type DisasterType = 'storm' | 'earthquake' | 'wildfire' | 'flood' | 'general';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  type: DisasterType;
  className?: string;
}

const RiskLevelBadge = ({ level, type, className }: RiskLevelBadgeProps) => {
  const getBgColor = () => {
    switch (level) {
      case 'low':
        return 'bg-risk-low/10 text-risk-low';
      case 'medium':
        return 'bg-risk-medium/10 text-risk-medium';
      case 'high':
        return 'bg-risk-high/10 text-risk-high';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'storm':
        return <CloudLightning className="h-5 w-5" />;
      case 'earthquake':
        return <Tornado className="h-5 w-5" />;
      case 'wildfire':
        return <AlertTriangle className="h-5 w-5" color="#ff4400" />;
      case 'flood':
        return <CloudRain className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getText = () => {
    const levelText = level.charAt(0).toUpperCase() + level.slice(1);
    const typeText = type.charAt(0).toUpperCase() + type.slice(1);
    return `${levelText} ${typeText} Risk`;
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
      getBgColor(),
      className
    )}>
      {getIcon()}
      <span className="font-medium">{getText()}</span>
    </div>
  );
};

export default RiskLevelBadge;
