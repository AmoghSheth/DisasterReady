import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import AlertCard from '@/components/AlertCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, AlertTriangle, Flame } from 'lucide-react';
import { getWeatherByZip, getFemaDisastersByState, getNwsAlertsByLatLon } from '@/utils/externalData';

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [nwsAlerts, setNwsAlerts] = useState<any[]>([]);
  const [latLon, setLatLon] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const zip = localStorage.getItem('userZipCode');
      if (!zip) return;
      try {
        const weatherData = await getWeatherByZip(zip);
        setWeatherAlerts(weatherData.alerts || []);
        if (weatherData.geo && weatherData.geo.state) {
          setLatLon({ lat: weatherData.geo.lat, lon: weatherData.geo.lon });
          const fema = await getFemaDisastersByState(weatherData.geo.state);
          setFemaDisasters(fema);
        }
        // If no OWM/FEMA alerts, try NWS
        if ((!weatherData.alerts || weatherData.alerts.length === 0) && weatherData.geo) {
          const nws = await getNwsAlertsByLatLon(weatherData.geo.lat, weatherData.geo.lon);
          setNwsAlerts(nws);
        }
      } catch (e) {
        setWeatherAlerts([]);
        setFemaDisasters([]);
        // Try NWS if OWM fails
        if (latLon) {
          try {
            const nws = await getNwsAlertsByLatLon(latLon.lat, latLon.lon);
            setNwsAlerts(nws);
          } catch {}
        }
      }
    };
    fetchAlerts();
    // eslint-disable-next-line
  }, []);

  // Combine and normalize all alerts
  const allAlerts = [
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
      id: `nws-${i}`,
      title: a.event,
      description: a.description,
      timestamp: new Date(a.start * 1000),
      severity: a.severity?.toLowerCase() || 'medium',
      type: a.event?.toLowerCase().includes('flood') ? 'flood' : a.event?.toLowerCase().includes('fire') ? 'wildfire' : a.event?.toLowerCase().includes('storm') ? 'storm' : 'general',
      icon: <AlertTriangle className="text-blue-400" />
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Filtering
  const filteredAlerts = allAlerts.filter(alert => {
    if (searchQuery && !(
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Live & historical alerts for your area</p>
      </motion.div>
      {/* Search & Filters */}
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
          <select
            className="border rounded px-2 py-1 text-sm text-gray-700"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="flood">Flood</option>
            <option value="wildfire">Wildfire</option>
            <option value="storm">Storm</option>
            <option value="general">General</option>
          </select>
          <select
            className="border rounded px-2 py-1 text-sm text-gray-700"
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              {filteredAlerts.map(alert => (
                <AlertCard key={alert.id} {...alert} />
              ))}
              {filteredAlerts.length === 0 && (
                <p className="text-center text-gray-500 py-8">No alerts match your search or filters</p>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Alerts;
