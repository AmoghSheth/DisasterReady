
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Bell, Moon, Globe, Home, Phone, Shield, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";

const Profile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('english');
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    toast.success(`${checked ? 'Dark' : 'Light'} mode activated`);
  };
  
  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast.success(`Language changed to ${value.charAt(0).toUpperCase() + value.slice(1)}`);
  };
  
  const handleLogout = () => {
    toast.info("This would log you out in a real app");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.div 
        className="bg-white px-5 py-4 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </motion.div>
      
      <div className="px-5 py-4">
        {/* User Profile */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mr-4">
            <User size={30} className="text-gray-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">John Doe</h2>
            <p className="text-sm text-gray-600">john.doe@example.com</p>
            <Button variant="link" className="p-0 h-auto text-sm text-disaster-blue">
              Edit Profile
            </Button>
          </div>
        </motion.div>
        
        {/* Household Information */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="font-semibold mb-4 flex items-center">
            <Home size={18} className="mr-2" /> Household Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="household-size" className="text-sm text-gray-600">
                  Household Size
                </Label>
                <Input id="household-size" value="3" readOnly className="bg-gray-50" />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm text-gray-600">
                  Location
                </Label>
                <Input id="location" value="Los Angeles, CA" readOnly className="bg-gray-50" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pets" className="text-sm text-gray-600">
                Pets
              </Label>
              <Input id="pets" value="Dog, Cat" readOnly className="bg-gray-50" />
            </div>
            
            <Button variant="outline" size="sm">
              Update Household Info
            </Button>
          </div>
        </motion.div>
        
        {/* Emergency Contacts */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h2 className="font-semibold mb-4 flex items-center">
            <Phone size={18} className="mr-2" /> Emergency Contacts
          </h2>
          
          <div className="space-y-3">
            {[
              { name: 'Jane Smith', relation: 'Spouse', phone: '(555) 123-4567' },
              { name: 'Robert Doe', relation: 'Parent', phone: '(555) 987-6543' }
            ].map((contact, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relation} • {contact.phone}</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full">
              Add Emergency Contact
            </Button>
          </div>
        </motion.div>
        
        {/* App Settings */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <h2 className="font-semibold mb-4">App Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Push Notifications
                </Label>
              </div>
              <Switch 
                id="notifications" 
                checked={notificationsEnabled} 
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={18} />
                <Label htmlFor="dark-mode" className="cursor-pointer">
                  Dark Mode
                </Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <Label htmlFor="language">Language</Label>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
        
        {/* Footer actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="space-y-4"
        >
          <Button variant="outline" className="w-full flex items-center justify-center" size="lg">
            <Shield className="mr-2" size={18} />
            Privacy Policy
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center text-disaster-red" 
            size="lg"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </Button>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
