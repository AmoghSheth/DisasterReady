
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import AlertCard from '@/components/AlertCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertTriangle, Flame, ServerCrash, Info } from 'lucide-react';
import { getWeatherByZip, getAllAlerts } from '@/utils/externalData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openWeatherMapAlerts, setOpenWeatherMapAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [nwsAlerts, setNwsAlerts] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { profile, loading: authLoading } = useAuth();
  

  useEffect(() => {
    const fetchAllAlerts = async () => {
      if (authLoading || !profile) return;

      setIsLoading(true);
      setErrors({});

      if (!profile.zip_code || !profile.location) {
        setErrors({ location: "Location not set. Please set your location in your profile." });
        setIsLoading(false);
        return;
      }

      try {
        const { lat, lng } = profile.location;

        // Get state for FEMA
        let state = null;
        try {
          const weatherData = await getWeatherByZip(profile.zip_code);
          state = weatherData.geo?.state || null;
        } catch (e) {
          console.error('Could not get state from weather data:', e);
        }

        // Fetch all alerts from all three sources
        const allAlertsData = await getAllAlerts(profile.zip_code, lat, lng, state);
        
        console.log('All alerts data:', allAlertsData);
        
        setOpenWeatherMapAlerts(allAlertsData.openWeatherMap || []);
        setNwsAlerts(allAlertsData.nws || []);
        setFemaDisasters(allAlertsData.fema || []);

        // Track which sources had errors
        if (allAlertsData.openWeatherMap.length === 0 && allAlertsData.nws.length === 0 && allAlertsData.fema.length === 0) {
          console.warn('No alerts found from any source');
        }

      } catch (e: any) {
        console.error(e);
        setErrors(prev => ({ ...prev, general: e.message || "An unknown error occurred." }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAlerts();
  }, [authLoading, profile]);

  const allAlerts = useMemo(() => {
    const fromOpenWeatherMap = (openWeatherMapAlerts || []).map((a: any) => ({
      event: a.event,
      description: a.description,
      start: a.start,
      end: a.end,
      severity: a.severity || 'moderate',
      sender_name: a.sender || 'OpenWeatherMap',
      type: a.event?.toLowerCase().includes('flood') ? 'flood' : a.event?.toLowerCase().includes('fire') ? 'wildfire' : a.event?.toLowerCase().includes('storm') ? 'storm' : 'general',
      sort_ts: a.start || 0,
    }));

    const fromFema = (femaDisasters || []).map((d: any) => {
      const startTs = d.declarationDate ? Math.floor(new Date(d.declarationDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
      return {
        event: d.incidentType || 'FEMA Disaster',
        description: d.declarationTitle || 'Federal disaster declaration in your area',
        start: startTs,
        end: startTs + 86400,
        severity: 'severe',
        sender_name: 'FEMA',
        type: d.incidentType?.toLowerCase().includes('flood') ? 'flood' : d.incidentType?.toLowerCase().includes('fire') ? 'wildfire' : d.incidentType?.toLowerCase().includes('storm') ? 'storm' : 'general',
        sort_ts: startTs,
      };
    });

    const fromNws = (nwsAlerts || []).map((a: any) => ({
      event: a.event,
      description: a.description,
      start: a.start,
      end: a.end,
      severity: a.severity || 'moderate',
      sender_name: a.sender || 'NWS',
      type: a.event?.toLowerCase().includes('flood') ? 'flood' : a.event?.toLowerCase().includes('fire') ? 'wildfire' : a.event?.toLowerCase().includes('storm') ? 'storm' : 'general',
      sort_ts: a.start || 0,
    }));

    return [...fromOpenWeatherMap, ...fromFema, ...fromNws]
      .sort((a, b) => (b.sort_ts || 0) - (a.sort_ts || 0));
  }, [openWeatherMapAlerts, femaDisasters, nwsAlerts]);

  const filteredAlerts = useMemo(() => allAlerts.filter(alert => {
    if (searchQuery && !(
      (alert.event || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  }), [allAlerts, searchQuery, filterType, filterSeverity]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    const hasErrors = Object.keys(errors).length > 0;

    if (filteredAlerts.length === 0 && !hasErrors) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Info className="mx-auto h-12 w-12 mb-4 text-blue-500" />
          <p className="font-semibold">No Alerts Found</p>
          <p>No active or recent alerts for your area (past 7 days).</p>
          <p className="text-sm mt-2">This is good news! Your area is currently safe.</p>
        </div>
      );
    }

    return (
      <>
        {hasErrors && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-700">
            <p>Some data could not be loaded. The following errors occurred:</p>
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}><strong>{key.toUpperCase()}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        )}
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, i) => (
            <AlertCard
              key={i}
              event={alert.event}
              start={alert.start}
              end={alert.end}
              description={alert.description}
              severity={alert.severity}
              sender_name={alert.sender_name}
            />
          ))
        ) : (
          <div className="text-center py-8 text-red-500">
            <ServerCrash className="mx-auto h-12 w-12 mb-4" />
            <p className="font-semibold">Error Fetching All Alerts</p>
            <p>Please try again later.</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Live & historical alerts for your area</p>
      </motion.div>
      
      <div className="px-5 py-4 max-w-5xl mx-auto">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm font-medium text-gray-500 mb-3">ALERT HISTORY</h2>
              {renderContent()}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Alerts;

