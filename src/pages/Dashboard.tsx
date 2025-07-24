import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import GoogleMap from '@/components/GoogleMap';
import { Bell, MapPin, ArrowRight, Cloud, AlertTriangle, Flame } from 'lucide-react';
import AlertCard from '@/components/AlertCard';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { getWeatherByLocation, getFemaDisastersByState, getAIAssessment, getAI5DayRiskForecast } from '@/utils/externalData';
import { Card, CardContent } from '@/components/ui/card';
import RiskAssessmentCard from '@/components/RiskAssessmentCard';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [fiveDayRiskForecast, setFiveDayRiskForecast] = useState<any[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { unreadCount, addNotification } = useNotifications();
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    if (!profile?.location) {
      return;
    }

    setIsDataLoading(true);
    setError(null);
    try {
      const weatherData = await getWeatherByLocation(profile.location);
      setWeather(weatherData.weather);
      setForecast(weatherData.forecast);
      setAlerts(weatherData.alerts);

      // Sequentially fetch AI assessments to avoid rate limiting
      const assessment = await getAIAssessment(weatherData);
      setRiskAssessment(assessment);

      if (weatherData.forecast && weatherData.forecast.length > 0) {
        const aiForecast = await getAI5DayRiskForecast(weatherData.forecast);
        console.log('[Dashboard] Received AI 5-day forecast data:', aiForecast);
        if (aiForecast && aiForecast.daily_risks) {
          setFiveDayRiskForecast(aiForecast.daily_risks);
        }
      }

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

      if (weatherData.geo && weatherData.geo.state) {
        const fema = await getFemaDisastersByState(weatherData.geo.state);
        setFemaDisasters(fema);
        
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
      console.error("[Dashboard Page] Failed to fetch dashboard data:", err);
      setError("We couldn't load the latest data. Please try again in a few moments.");
    } finally {
      setIsDataLoading(false);
    }
  }, [profile, authLoading, addNotification, navigate]);

  useEffect(() => {
    if (!authLoading && profile) {
      fetchData();
    }
  }, [profile, authLoading, fetchData]);

  const renderDashboardContent = () => {
    console.log('[Dashboard Page] renderDashboardContent called:', { authLoading, profile, error, isDataLoading });
    if (authLoading) {
      console.log('[Dashboard Page] Rendering: Auth loading skeleton.');
      return (
        <div className="px-5 py-4 space-y-6">
          <Skeleton className="h-24 w-full bg-muted" />
          <Skeleton className="h-32 w-full bg-muted" />
          <Skeleton className="h-40 w-full bg-muted" />
          <Skeleton className="h-64 w-full bg-muted" />
        </div>
      );
    }

    if (!profile) {
      console.log('[Dashboard Page] Rendering: No profile, redirecting to login.');
      // This is a safeguard. If there's no profile, we shouldn't be on the dashboard.
      navigate('/login');
      return null;
    }

    if (!profile.location) {
      console.log('[Dashboard Page] Rendering: No location found, showing setup prompt.');
      return (
        <div className="px-5 py-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-4">Please complete your setup to see personalized alerts and information.</p>
          <Button onClick={() => navigate('/location-setup')}>
            Go to Setup
          </Button>
        </div>
      );
    }

    if (error) {
      console.log('[Dashboard Page] Rendering: Error state.');
      return (
        <div className="px-5 py-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold my-2">Could Not Load Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData}>
            Try Again
          </Button>
        </div>
      );
    }

    if (isDataLoading) {
      console.log('[Dashboard Page] Rendering: Data loading skeleton.');
      return (
        <div className="px-5 py-4 space-y-6">
          <Skeleton className="h-24 w-full bg-muted" />
          <Skeleton className="h-32 w-full bg-muted" />
          <Skeleton className="h-40 w-full bg-muted" />
          <Skeleton className="h-64 w-full bg-muted" />
        </div>
      );
    }

    console.log('[Dashboard Page] Rendering: Main content.');
    return (
      <div className="px-5 py-4">
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MapPin size={18} className="text-muted-foreground mr-1" />
          <span className="text-sm text-muted-foreground">
            {`ZIP Code: ${profile.zip_code}`}
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
        
        {fiveDayRiskForecast.length > 0 && (
          <Card className="card-effect mb-6 p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="text-yellow-500" /> 5-Day AI Risk Forecast</h2>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={fiveDayRiskForecast.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }) }))}>
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
                    borderColor: 'hsl(var(--border))'
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value, name, props) => [`${value}%`, `Risk: ${props.payload.justification}`]}
                />
                <Area type="monotone" dataKey="risk" stroke="hsl(var(--primary))" fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
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
          {profile?.location ? (
            <GoogleMap center={profile.location} zoom={11} height="200px" markers={[{ position: profile.location, title: 'Your Location' }]} />
          ) : (
            <div className="bg-muted h-48 flex items-center justify-center"><p className="text-muted-foreground">Loading map...</p></div>
          )}
          <CardContent className="p-4">
            <h3 className="font-medium">Nearby Emergency Resources</h3>
            <p className="text-sm text-muted-foreground mt-1">Shelters and medical centers in your area</p>
            <Button className="w-full mt-3" variant="outline" onClick={() => navigate('/map')}>View Full Map</Button>
          </CardContent>
        </motion.div>
      </div>
    );
  };

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
      {renderDashboardContent()}
      
      <BottomNavigation />
      
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
