import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CloudLightning, CloudRain, Tornado } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { Flame, Wind } from "lucide-react";

type AlertSeverity = 'low' | 'medium' | 'high';
type AlertType = 'storm' | 'earthquake' | 'wildfire' | 'flood' | 'general';

interface AlertCardProps {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  severity: AlertSeverity;
  type: AlertType;
}

const getIcon = (type: AlertType) => {
  switch (type) {
    case 'storm':
      return <CloudLightning className="text-yellow-500" size={18} />;
    case 'flood':
      return <Flame className="text-orange-500" size={18} />;
    case 'wildfire':
      return <Flame className="text-red-500" size={18} />;
    default:
      return <AlertTriangle className="text-blue-500" size={18} />;
  }
};

const getSeverityColor = (severity: AlertCardProps["severity"]) => {
  switch (severity) {
    case 'high':
      return 'border-risk-high bg-red-50';
    case 'medium':
      return 'border-risk-medium bg-yellow-50';
    default:
      return 'border-risk-low bg-green-50';
  }
};

const AlertCard = ({ 
  id,
  title, 
  description, 
  timestamp, 
  severity, 
  type,
}: AlertCardProps) => {
  return (
    <motion.div
      className={`alert-card ${getSeverityColor(severity)} p-3 sm:p-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon(type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{title}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {format(timestamp, "MMM d, h:mm a")}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              severity === "high" 
                ? "bg-red-100 text-red-700" 
                : severity === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)} Risk
            </span>
            <span className="text-xs text-gray-500">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
