import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { Toaster as Sonner } from './components/ui/sonner.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import LocationProvider from './contexts/LocationContext.tsx';
import { HouseholdProvider } from './contexts/HouseholdContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import OrientationGuard from './components/OrientationGuard.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OrientationGuard>
          <GoogleMapsProvider>
            <NotificationProvider>
              <LocationProvider>
                <HouseholdProvider>
                  <AuthProvider>
                    <App />
                  </AuthProvider>
                </HouseholdProvider>
              </LocationProvider>
            </NotificationProvider>
          </GoogleMapsProvider>
        </OrientationGuard>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);