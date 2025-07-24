import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CloudLightning, CloudRain, Tornado } from 'lucide-react';
import { format } from 'date-fns';

interface AlertCardProps {
  event: string;
  start: number;
  end: number;
  description: string;
  severity: AlertSeverity;
  sender_name: string;
  className?: string;
}

const AlertCard = ({ 
  event: title,
  start,
  description, 
  severity, 
  className 
}: AlertCardProps) => {
  const getBorderColor = () => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return 'border-green-500';
      case 'moderate':
        return 'border-yellow-500';
      case 'severe':
      case 'extreme':
        return 'border-red-500';
      default:
        return 'border-gray-400';
    }
  };

  const getIcon = () => {
    const lowerCaseTitle = title?.toLowerCase() || '';
    if (lowerCaseTitle.includes('storm') || lowerCaseTitle.includes('thunderstorm')) {
      return <CloudLightning className="h-6 w-6 text-blue-500" />;
    }
    if (lowerCaseTitle.includes('rain') || lowerCaseTitle.includes('flood')) {
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    }
    if (lowerCaseTitle.includes('tornado')) {
      return <Tornado className="h-6 w-6 text-orange-500" />;
    }
    if (lowerCaseTitle.includes('fire')) {
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
    return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
  };

  const getSeverityBadge = () => {
    if (!severity) return null;
    const colors = {
      minor: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      severe: 'bg-red-100 text-red-800',
      extreme: 'bg-red-100 text-red-800',
    };
    
    const severityKey = severity.toLowerCase() as keyof typeof colors;

    return (
      <span className={cn(
        'px-2 py-1 text-xs font-medium rounded',
        colors[severityKey] || 'bg-gray-100 text-gray-800'
      )}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const formattedDate = start && typeof start === 'number' 
    ? format(new Date(start * 1000), 'MMM d, yyyy • h:mm a')
    : 'No date available';

  return (
    <div className={cn(
      'bg-card rounded-xl shadow-md p-4 border-l-4 mb-4',
      getBorderColor(),
      className
    )}>
      <div className="flex items-start">
        <div className="mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold">{title}</h3>
            {getSeverityBadge()}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <p className="text-xs text-muted-foreground">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
