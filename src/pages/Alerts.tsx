
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import AlertCard from '@/components/AlertCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertTriangle, Flame, ServerCrash, Info } from 'lucide-react';
import { getWeatherByZip, getFemaDisastersByState, getNwsAlertsByLatLon } from '@/utils/externalData';
import { useGoogleMapsContext } from '@/contexts/GoogleMapsContext';
import { Skeleton } from '@/components/ui/skeleton';

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [nwsAlerts, setNwsAlerts] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mapsService, isLoaded } = useGoogleMapsContext();

  useEffect(() => {
    const fetchAllAlerts = async () => {
      if (!isLoaded || !mapsService) return;

      setIsLoading(true);
      setErrors({});
      const zip = localStorage.getItem('userZipCode');
      const locationStr = localStorage.getItem('userLocation');

      if (!zip || !locationStr) {
        setErrors({ location: "Location not set. Please set your location in your profile." });
        setIsLoading(false);
        return;
      }

      try {
        const location = JSON.parse(locationStr);
        const { lat, lng } = location;

        const geoData = await mapsService.reverseGeocode({ lat, lng });
        const state = geoData?.state;

        const results = await Promise.allSettled([
          getWeatherByZip(zip),
          state ? getFemaDisastersByState(state) : Promise.resolve([]),
          getNwsAlertsByLatLon(lat, lng)
        ]);

        const [owmResult, femaResult, nwsResult] = results;

        if (owmResult.status === 'fulfilled') {
          setWeatherAlerts(owmResult.value.alerts || []);
        } else {
          console.error("OpenWeatherMap Error:", owmResult.reason);
          setErrors(prev => ({ ...prev, weather: 'Could not load weather alerts.' }));
        }

        if (femaResult.status === 'fulfilled') {
          setFemaDisasters(femaResult.value);
        } else {
          console.error("FEMA Error:", femaResult.reason);
          setErrors(prev => ({ ...prev, fema: 'Could not load FEMA disasters.' }));
        }

        if (nwsResult.status === 'fulfilled') {
          setNwsAlerts(nwsResult.value);
        } else {
          console.error("NWS Error:", nwsResult.reason);
          setErrors(prev => ({ ...prev, nws: 'Could not load NWS alerts.' }));
        }

      } catch (e: any) {
        console.error(e);
        setErrors(prev => ({ ...prev, general: e.message || "An unknown error occurred." }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAlerts();
  }, [isLoaded, mapsService]);

  const allAlerts = useMemo(() => [
    ...weatherAlerts.map((a, i) => ({
      id: `weather-${i}`,
      title: a.event,
      description: a.description,
      timestamp: new Date(a.start * 1000),
      severity: a.severity?.toLowerCase() || 'medium',
      type: a.event?.toLowerCase().includes('flood') ? 'flood' : a.event?.toLowerCase().includes('fire') ? 'wildfire' : a.event?.toLowerCase().includes('storm') ? 'storm' : 'general',
      icon: <AlertTriangle className="text-red-400" />
    })),
    ...femaDisasters.map((d, i) => ({
      id: `fema-${i}`,
      title: d.incidentType,
      description: d.declarationTitle,
      timestamp: new Date(d.declarationDate),
      severity: 'high',
      type: d.incidentType?.toLowerCase().includes('flood') ? 'flood' : d.incidentType?.toLowerCase().includes('fire') ? 'wildfire' : d.incidentType?.toLowerCase().includes('storm') ? 'storm' : 'general',
      icon: <Flame className="text-orange-400" />
    })),
    ...nwsAlerts.map((a, i) => ({
      id: `nws-${a.id || i}`,
      title: a.event,
      description: a.description,
      timestamp: new Date(a.start * 1000),
      severity: a.severity?.toLowerCase() || 'medium',
      type: a.event?.toLowerCase().includes('flood') ? 'flood' : a.event?.toLowerCase().includes('fire') ? 'wildfire' : a.event?.toLowerCase().includes('storm') ? 'storm' : 'general',
      icon: <AlertTriangle className="text-blue-400" />
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [weatherAlerts, femaDisasters, nwsAlerts]);

  const filteredAlerts = useMemo(() => allAlerts.filter(alert => {
    if (searchQuery && !(
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="font-semibold">No Active Alerts</p>
          <p>There are currently no alerts for your area.</p>
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
          filteredAlerts.map(alert => <AlertCard key={alert.id} {...alert} />)
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
      
      <div className="px-5 py-4">
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

