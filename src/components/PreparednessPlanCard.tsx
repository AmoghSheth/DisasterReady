
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';

interface PreparednessPlanCardProps {
  title: string;
  isCompleted: boolean;
  onClick: () => void;
  className?: string;
}

const PreparednessPlanCard = ({ 
  title, 
  isCompleted, 
  onClick,
  className 
}: PreparednessPlanCardProps) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-2 flex items-center justify-between',
        isCompleted ? 'bg-green-50' : '',
        className
      )}
      onClick={onClick}
    >
      <span className={cn(
        'font-medium',
        isCompleted ? 'text-green-700 line-through' : ''
      )}>
        {title}
      </span>
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center', 
        isCompleted 
          ? 'bg-green-500 text-white' 
          : 'border-2 border-gray-300'
      )}>
        {isCompleted ? <Check size={14} /> : <Plus size={14} />}
      </div>
    </div>
  );
};

export default PreparednessPlanCard;
