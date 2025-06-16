import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Plus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreparednessPlanCardProps {
  title: string;
  isCompleted: boolean;
  onClick: () => void;
  className?: string;
  quantity?: number;
  highlight?: boolean;
}

const PreparednessPlanCard = ({ 
  title, 
  isCompleted, 
  onClick,
  className,
  quantity,
  highlight
}: PreparednessPlanCardProps) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm border p-4 mb-2 flex items-center justify-between group hover:shadow-md transition-all',
        isCompleted ? 'bg-green-50 border-green-100' : '',
        highlight ? 'border-2 border-yellow-400 bg-yellow-50 animate-pulse' : 'border-gray-100',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center transition-colors', 
          isCompleted 
            ? 'bg-green-500 text-white' 
            : 'border-2 border-gray-300 group-hover:border-gray-400'
        )}>
          {isCompleted ? <Check size={14} /> : <Plus size={14} />}
        </div>
        <div>
          <span className={cn(
            'font-medium',
            isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
          )}>
            {title}
          </span>
          {quantity && quantity > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center mt-1">
                    <Info size={12} className="text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      Quantity: {quantity}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recommended quantity based on your household size</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreparednessPlanCard;
