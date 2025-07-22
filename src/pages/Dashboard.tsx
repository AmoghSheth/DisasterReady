import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import GoogleMap from '@/components/GoogleMap';
import { Bell, MapPin, ArrowRight } from 'lucide-react';
import AlertCard from '@/components/AlertCard';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Location } from '@/utils/googleMaps';
import { getWeatherByZip, getFemaDisastersByState, getAIAssessment } from '@/utils/externalData';
import { Card } from '@/components/ui/card';
import { Cloud, AlertTriangle, Flame } from 'lucide-react';
import RiskAssessmentCard from '@/components/RiskAssessmentCard';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/NotificationPanel';

const getRiskFromForecast = (forecast) => {
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
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const navigate = useNavigate();
  const { unreadCount, addNotification } = useNotifications();
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
          
          if (savedZipCode) {
            setLocationName(savedZipCode);
            try {
              const weatherData = await getWeatherByZip(savedZipCode);
              setWeather(weatherData.weather);
              setForecast(weatherData.forecast);
              setAlerts(weatherData.alerts);

              // Add notifications for weather alerts
              if (weatherData.alerts && weatherData.alerts.length > 0) {
                weatherData.alerts.forEach((alert: any) => {
                  const severity = alert.severity?.toLowerCase();
                  addNotification({
                    title: alert.event || 'Weather Alert',
                    message: alert.description || 'Check local conditions',
                    type: severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info',
                    source: 'National Weather Service'
                  });
                });
              }

              const assessment = await getAIAssessment(weatherData);
              setRiskAssessment(assessment);

              if (weatherData.geo && weatherData.geo.state) {
                const fema = await getFemaDisastersByState(weatherData.geo.state);
                setFemaDisasters(fema);
                
                // Add notifications for FEMA disasters
                if (fema && fema.length > 0) {
                  fema.forEach((disaster: any) => {
                    addNotification({
                      title: `FEMA Disaster: ${disaster.incidentType}`,
                      message: disaster.declarationTitle || 'Federal disaster declaration in your area',
                      type: 'warning',
                      source: 'FEMA'
                    });
                  });
                }
              }
            } catch (err) {
              // Handle errors gracefully
            }
          } else {
            setLocationName('Your Location');
          }
        } catch (error) {
          setLocationName('Location Setup Required');
        }
      } else {
        setLocationName('Location Setup Required');
      }
    };

    loadUserLocation();
  }, []);

  // Add some sample notifications for demonstration
  useEffect(() => {
    const hasAddedSampleNotifications = localStorage.getItem('sampleNotificationsAdded');
    if (!hasAddedSampleNotifications) {
      // Add sample notifications
      addNotification({
        title: 'Welcome to DisasterReady!',
        message: 'Your emergency preparedness app is now set up and ready to help keep you safe.',
        type: 'success',
        source: 'System'
      });
      
      addNotification({
        title: 'Profile Setup Reminder',
        message: 'Complete your household information and emergency contacts for better preparedness recommendations.',
        type: 'info',
        source: 'System'
      });
      
      localStorage.setItem('sampleNotificationsAdded', 'true');
    }
  }, [addNotification]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div 
        className="bg-card px-5 py-4 shadow-sm flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground mt-2">
            {format(currentTime, 'EEEE, MMMM d • h:mm a')}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          onClick={() => setIsNotificationPanelOpen(true)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-xs text-white font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </motion.div>
      
      {/* Main Content */}
      <div className="px-5 py-4">
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MapPin size={18} className="text-muted-foreground mr-1" />
          <span className="text-sm text-muted-foreground">
            {locationName === 'Location Setup Required' ? (
              <button 
                onClick={() => navigate('/location-setup')}
                className="text-primary underline"
              >
                Set Your Location
              </button>
            ) : (
              locationName
            )}
          </span>
        </motion.div>
        
        <RiskAssessmentCard assessment={riskAssessment} />
        
        {weather && (
          <Card className="card-effect mb-6 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="text-primary" />
              <span className="font-semibold text-foreground">Today's Weather</span>
              <span className="ml-auto text-sm text-muted-foreground">{weather.weather?.[0]?.main} {Math.round(weather.main?.temp)}°F</span>
            </div>
            <div className="text-xs text-muted-foreground">{weather.weather?.[0]?.description}</div>
            {alerts && alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="text-destructive" />
                <span className="text-destructive font-medium">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {femaDisasters && femaDisasters.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Flame className="text-orange-400" />
                <span className="text-orange-400 font-medium">Recent Disaster: {femaDisasters[0].incidentType}</span>
              </div>
            )}
          </Card>
        )}
        
        {forecast && forecast.length > 0 && (
          <div className="card-effect mb-6 p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="text-yellow-500" /> 7-Day Risk Forecast</h2>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={getRiskFromForecast(forecast)}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} hide />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Area type="monotone" dataKey="risk" stroke="hsl(var(--primary))" fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Live Alerts</h2>
            <Button variant="ghost" size="sm" className="text-primary flex items-center" onClick={() => navigate('/alerts')}>
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          {alerts.slice(0, 2).map((alert, i) => <AlertCard key={i} {...alert} />)}
        </motion.div>
        
        <motion.div className="card-effect mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {userLocation ? (
            <GoogleMap center={userLocation} zoom={11} height="200px" markers={[{ position: userLocation, title: 'Your Location' }]} />
          ) : (
            <div className="bg-muted h-48 flex items-center justify-center"><p className="text-muted-foreground">Loading map...</p></div>
          )}
          <div className="p-4">
            <h3 className="font-medium">Nearby Emergency Resources</h3>
            <p className="text-sm text-muted-foreground mt-1">Shelters and medical centers in your area</p>
            <Button className="w-full mt-3" variant="outline" onClick={() => navigate('/map')}>View Full Map</Button>
          </div>
        </motion.div>
      </div>
      
      <BottomNavigation />
      
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
