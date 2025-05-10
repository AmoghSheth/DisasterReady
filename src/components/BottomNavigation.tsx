
import React from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, CheckSquare, Map, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, text: 'Home', path: '/dashboard' },
    { icon: Bell, text: 'Alerts', path: '/alerts' },
    { icon: CheckSquare, text: 'Plan', path: '/plan' },
    { icon: Map, text: 'Map', path: '/map' },
    { icon: User, text: 'Profile', path: '/profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-10">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path}
            to={item.path} 
            className={cn(
              'flex flex-col items-center pt-2 pb-1 px-3 rounded-lg',
              isActive 
                ? 'text-disaster-blue' 
                : 'text-gray-500 hover:text-disaster-blue'
            )}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.text}</span>
            {isActive && (
              <div className="h-1 w-8 bg-disaster-blue rounded-full mt-1" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
