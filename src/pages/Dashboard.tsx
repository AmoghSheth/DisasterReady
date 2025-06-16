import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import GoogleMap from '@/components/GoogleMap';
import { Bell, MapPin, ArrowRight } from 'lucide-react';
import RiskLevelBadge from '@/components/RiskLevelBadge';
import AlertCard from '@/components/AlertCard';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Location } from '@/utils/googleMaps';
import { getWeatherByZip, getFemaDisastersByState } from '@/utils/externalData';
import { Card } from '@/components/ui/card';
import { Cloud, AlertTriangle, Flame } from 'lucide-react';

// Mock data
const mockAlerts = [
  {
    id: 1,
    title: 'Tornado Watch',
    description: 'Possible tornado formation in your area. Monitor local weather updates.',
    timestamp: new Date(),
    severity: 'medium' as const,
    type: 'storm' as const,
  },
  {
    id: 2,
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall causing flood conditions. Avoid low-lying areas.',
    timestamp: new Date(Date.now() - 3600000),
    severity: 'high' as const,
    type: 'flood' as const,
  },
];

const mockRiskData = [
  { date: 'Mon', risk: 20 },
  { date: 'Tue', risk: 30 },
  { date: 'Wed', risk: 45 },
  { date: 'Thu', risk: 60 },
  { date: 'Fri', risk: 40 },
  { date: 'Sat', risk: 25 },
  { date: 'Sun', risk: 15 },
];

const getRiskFromForecast = (forecast) => {
  // Returns array of { date, risk } for 7 days
  if (!forecast || !Array.isArray(forecast)) return [];
  return forecast.slice(0, 7).map(day => {
    let risk = 20;
    const main = day.weather?.[0]?.main || '';
    if (/storm|tornado|hurricane/i.test(main)) risk = 80;
    else if (/rain|snow/i.test(main)) risk = 50;
    else if (/extreme|heat|cold/i.test(main)) risk = 70;
    return {
      date: new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }),
      risk
    };
  });
};

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('Location');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUserLocation = async () => {
      const savedLocation = localStorage.getItem('userLocation');
      const savedZipCode = localStorage.getItem('userZipCode');
      
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          setUserLocation(parsedLocation);
          
          // If we have a ZIP code, use it for display
          if (savedZipCode) {
            setLocationName(savedZipCode);
            // Fetch weather and disaster data
            try {
              const weatherData = await getWeatherByZip(savedZipCode);
              setWeather(weatherData.weather);
              setForecast(weatherData.forecast);
              setAlerts(weatherData.alerts);
              // Use state from weather geo for FEMA
              if (weatherData.geo && weatherData.geo.state) {
                const fema = await getFemaDisastersByState(weatherData.geo.state);
                setFemaDisasters(fema);
              }
              // Risk calculation: high if severe weather alert, medium if rain/snow, else low
              if (weatherData.alerts && weatherData.alerts.length > 0) {
                setRiskLevel('high');
              } else if (weatherData.weather && (weatherData.weather.weather[0]?.main === 'Rain' || weatherData.weather.weather[0]?.main === 'Snow')) {
                setRiskLevel('medium');
              } else {
                setRiskLevel('low');
              }
            } catch (err) {
              setWeather(null);
              setForecast([]);
              setAlerts([]);
              setRiskLevel('low');
            }
          } else {
            // Try to reverse geocode the location to get a readable name
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${parsedLocation.lat},${parsedLocation.lng}&key=AIzaSyCOUApwzid4BeHZb3AE_sy8KILH0e0xkco`
              );
              const data = await response.json();
              
              if (data.results && data.results[0]) {
                const addressComponents = data.results[0].address_components;
                let city = '';
                let state = '';
                
                addressComponents.forEach((component: any) => {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  }
                });
                
                if (city && state) {
                  setLocationName(`${city}, ${state}`);
                } else {
                  setLocationName('Your Location');
                }
              } else {
                setLocationName('Your Location');
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error);
              setLocationName('Your Location');
            }
          }
        } catch (error) {
          console.error('Error parsing saved location:', error);
          // Only fallback to LA if there's an error parsing
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
          setLocationName('Location Setup Required');
        }
      } else {
        // No saved location - prompt user to set location
        setUserLocation(null);
        setLocationName('Location Setup Required');
      }
    };

    loadUserLocation();
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk < 30) return '#34C759';
    if (risk < 50) return '#FFCC00';
    return '#FF3B30';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-4 sm:px-5 py-3 sm:py-4 shadow-sm flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Logo size="sm" />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {format(currentTime, 'EEEE, MMMM d • h:mm a')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-disaster-red rounded-full"></span>
          </Button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="px-4 sm:px-5 py-4">
        <motion.div
          className="mb-4 sm:mb-6 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <MapPin size={16} className="text-gray-500 mr-1" />
          <span className="text-xs sm:text-sm text-gray-500">
            {!locationName ? (
              <button 
                onClick={() => navigate('/location-setup')}
                className="text-disaster-blue underline"
              >
                Set Your Location
              </button>
            ) : (
              locationName
            )}
          </span>
        </motion.div>
        
        {/* Risk Level Card */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Current Risk Level</h2>
          <RiskLevelBadge level={riskLevel} type="storm" />
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
            {riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'} Risk
          </p>
        </motion.div>
        
        {/* Weather/Disaster Summary Widget */}
        {weather && (
          <Card className="mb-4 sm:mb-6 p-3 sm:p-4 flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="text-blue-400" size={18} />
              <span className="font-semibold text-blue-700 text-sm sm:text-base">Today's Weather</span>
              <span className="ml-auto text-xs sm:text-sm text-gray-500">{weather.weather?.[0]?.main} {Math.round(weather.main?.temp)}°F</span>
            </div>
            <div className="text-xs text-gray-600">{weather.weather?.[0]?.description}</div>
            {alerts && alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="text-red-500" size={16} />
                <span className="text-xs sm:text-sm text-red-700 font-medium">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {femaDisasters && femaDisasters.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Flame className="text-orange-400" size={16} />
                <span className="text-xs sm:text-sm text-orange-700 font-medium">Recent Disaster: {femaDisasters[0].incidentType}</span>
              </div>
            )}
          </Card>
        )}
        
        {/* 7-Day Risk Forecast */}
        {forecast && forecast.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h2 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={18} /> 
              <span>7-Day Risk Forecast</span>
            </h2>
            <div className="h-[120px] sm:h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getRiskFromForecast(forecast)}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFCC00" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip formatter={(v) => `${v}/100`} />
                  <Area type="monotone" dataKey="risk" stroke="#FF3B30" fillOpacity={1} fill="url(#riskGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Live Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="font-semibold text-base sm:text-lg">Live Alerts</h2>
            <Button variant="ghost" size="sm" className="text-disaster-blue flex items-center text-xs sm:text-sm">
              View All <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertCard key={alert.id} {...alert} />
            ))}
          </div>
        </motion.div>
        
        {/* Map Preview */}
        <motion.div 
          className="mt-4 sm:mt-6 rounded-xl overflow-hidden shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {userLocation ? (
            <GoogleMap
              center={userLocation}
              zoom={11}
              height="180px"
              markers={[
                {
                  position: userLocation,
                  title: 'Your Location',
                  icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
              ]}
            />
          ) : (
            <div className="bg-gray-200 h-40 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading map...</p>
              </div>
            </div>
          )}
          <div className="bg-white p-3 sm:p-4">
            <h3 className="font-medium text-sm sm:text-base">Nearby Emergency Resources</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Emergency shelters and medical centers in your area
            </p>
            <Button 
              className="w-full mt-3 text-sm" 
              variant="outline"
              onClick={() => navigate('/map')}
            >
              View Full Map
            </Button>
          </div>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
