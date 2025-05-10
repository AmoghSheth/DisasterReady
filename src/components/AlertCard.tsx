
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Hurricane, Earthquake, Wildfire } from 'lucide-react';
import { format } from 'date-fns';

type AlertSeverity = 'low' | 'medium' | 'high';
type AlertType = 'storm' | 'earthquake' | 'wildfire' | 'flood' | 'general';

interface AlertCardProps {
  title: string;
  description: string;
  timestamp: Date;
  severity: AlertSeverity;
  type: AlertType;
  className?: string;
}

const AlertCard = ({ 
  title, 
  description, 
  timestamp, 
  severity, 
  type,
  className 
}: AlertCardProps) => {
  const getBorderColor = () => {
    switch (severity) {
      case 'low':
        return 'border-green-500';
      case 'medium':
        return 'border-yellow-500';
      case 'high':
        return 'border-red-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'storm':
        return <Hurricane className="h-6 w-6 text-blue-500" />;
      case 'earthquake':
        return <Earthquake className="h-6 w-6 text-orange-500" />;
      case 'wildfire':
        return <Wildfire className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getSeverityBadge = () => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={cn(
        'px-2 py-1 text-xs font-medium rounded',
        colors[severity]
      )}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-md p-4 border-l-4 mb-4',
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
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <p className="text-xs text-gray-500">
            {format(timestamp, 'MMM d, yyyy • h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
