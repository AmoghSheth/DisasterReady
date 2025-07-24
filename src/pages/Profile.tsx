
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Bell, Moon, Globe, Home, Phone, Shield, LogOut, Plus, Edit2, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

const Profile = () => {
  const { profile, loading: authLoading, updateUserProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'english';
  });
  const [locationName, setLocationName] = useState('Your Location');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', relation: '', phone: '' });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingHousehold, setIsEditingHousehold] = useState(false);
  const [householdForm, setHouseholdForm] = useState({ size: 1, pets: '', medicalNeeds: '', location: { lat: 0, lng: 0 }, zip_code: '' });
  const navigate = useNavigate();

  // Load initial data from profile
  useEffect(() => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || '', email: profile.username || '' });
      setHouseholdForm({
        size: profile.household_size || 1,
        pets: profile.pets?.join(', ') || '',
        medicalNeeds: profile.medical_needs?.join(', ') || '',
        location: profile.location || { lat: 0, lng: 0 },
        zip_code: profile.zip_code || '',
      });
      if (profile.zip_code) {
        setLocationName(profile.zip_code);
      } else if (profile.location) {
        setLocationName(`${profile.location.lat.toFixed(2)}, ${profile.location.lng.toFixed(2)}`);
      }
    }
  }, [profile]);

  // Load emergency contacts from Supabase
  useEffect(() => {
    const fetchContacts = async () => {
      if (!profile?.username) return;
      const { data, error } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('username', profile.username);
      if (error) {
        console.error("Error fetching contacts:", error);
      } else {
        setEmergencyContacts(data as EmergencyContact[]);
      }
    };
    fetchContacts();
  }, [profile]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    toast.success(`${checked ? 'Dark' : 'Light'} mode activated`);
  };
  
  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notifications', checked.toString());
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    toast.success(`Language changed to ${value.charAt(0).toUpperCase() + value.slice(1)}`);
  };

  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.phone || !profile?.username) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newContact = {
      username: profile.username,
      name: contactForm.name,
      relation: contactForm.relation,
      phone: contactForm.phone
    };
    
    const { data, error } = await supabase
      .from('user_contacts')
      .insert(newContact)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to add contact: ${error.message}`);
    } else {
      setEmergencyContacts(prev => [...prev, data as EmergencyContact]);
      setContactForm({ name: '', relation: '', phone: '' });
      setIsAddingContact(false);
      toast.success('Emergency contact added successfully');
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, relation: contact.relation, phone: contact.phone });
  };

  const handleUpdateContact = async () => {
    if (!editingContact || !contactForm.name || !contactForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const { error } = await supabase
      .from('user_contacts')
      .update({ name: contactForm.name, relation: contactForm.relation, phone: contactForm.phone })
      .eq('id', editingContact.id);

    if (error) {
      toast.error(`Failed to update contact: ${error.message}`);
    } else {
      setEmergencyContacts(prev => 
        prev.map(contact =>
          contact.id === editingContact.id
            ? { ...contact, name: contactForm.name, relation: contactForm.relation, phone: contactForm.phone }
            : contact
        )
      );
      setEditingContact(null);
      setContactForm({ name: '', relation: '', phone: '' });
      toast.success('Emergency contact updated successfully');
    }
  };

  const resetContactForm = () => {
    setContactForm({ name: '', relation: '', phone: '' });
    setEditingContact(null);
    setIsAddingContact(false);
  };

  const handleEditProfile = () => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || '', email: profile.username || '' });
    }
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.full_name || !profileForm.email) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const { success, error } = await updateUserProfile({
      full_name: profileForm.full_name,
      username: profileForm.email, // Assuming username can be updated via email
    });

    if (success) {
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } else {
      toast.error(`Failed to update profile: ${error}`);
    }
  };

  const resetProfileForm = () => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || '', email: profile.username || '' });
    }
    setIsEditingProfile(false);
  };

  const handleEditHousehold = () => {
    if (profile) {
      setHouseholdForm({
        size: profile.household_size || 1,
        pets: profile.pets?.join(', ') || '',
        medicalNeeds: profile.medical_needs?.join(', ') || '',
        location: profile.location || { lat: 0, lng: 0 },
        zip_code: profile.zip_code || '',
      });
    }
    setIsEditingHousehold(true);
  };

  const handleUpdateHousehold = async () => {
    if (householdForm.size < 1) {
      toast.error('Household size must be at least 1');
      return;
    }
    
    const updatedHouseholdData = {
      household_size: householdForm.size,
      pets: householdForm.pets.split(',').map(pet => pet.trim()).filter(pet => pet),
      medical_needs: householdForm.medicalNeeds.split(',').map(need => need.trim()).filter(need => need),
      location: householdForm.location,
      zip_code: householdForm.zip_code,
    };
    
    const { success, error } = await updateUserProfile(updatedHouseholdData);

    if (success) {
      setIsEditingHousehold(false);
      toast.success('Household information updated successfully');
    } else {
      toast.error(`Failed to update household information: ${error}`);
    }
  };

  const resetHouseholdForm = () => {
    if (profile) {
      setHouseholdForm({
        size: profile.household_size || 1,
        pets: profile.pets?.join(', ') || '',
        medicalNeeds: profile.medical_needs?.join(', ') || '',
        location: profile.location || { lat: 0, lng: 0 },
        zip_code: profile.zip_code || '',
      });
    }
    setIsEditingHousehold(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      toast.error(`Failed to delete contact: ${error.message}`);
    } else {
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast.success('Emergency contact deleted successfully');
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.info("You have been logged out.");
      navigate('/login');
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <motion.div 
          className="bg-white px-5 py-4 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Loading your profile...</p>
        </motion.div>
        <div className="px-5 py-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

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
            <h2 className="font-semibold text-lg">{profile.full_name || 'N/A'}</h2>
            <p className="text-sm text-gray-600">{profile.username}</p>
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-disaster-blue"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} className="flex-1">
                      Update Profile
                    </Button>
                    <Button variant="outline" onClick={resetProfileForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                <Input 
                  id="household-size" 
                  value={profile.household_size || 1} 
                  readOnly 
                  className="bg-gray-50" 
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm text-gray-600">
                  Location
                </Label>
                <div className="flex space-x-2">
                  <Input id="location" value={locationName} readOnly className="bg-gray-50 flex-1" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/location-setup')}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="pets" className="text-sm text-gray-600">
                Pets
              </Label>
              <Input 
                id="pets" 
                value={profile.pets?.length > 0 ? profile.pets.join(', ') : 'None'} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            
            <div>
              <Label htmlFor="medical-needs" className="text-sm text-gray-600">
                Medical Needs
              </Label>
              <Input 
                id="medical-needs" 
                value={profile.medical_needs?.length > 0 ? profile.medical_needs.join(', ') : 'None'} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            
            <Dialog open={isEditingHousehold} onOpenChange={setIsEditingHousehold}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleEditHousehold}>
                  Update Household Info
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Household Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-household-size">Household Size</Label>
                    <Input
                      id="edit-household-size"
                      type="number"
                      min="1"
                      value={householdForm.size}
                      onChange={(e) => setHouseholdForm(prev => ({ ...prev, size: parseInt(e.target.value) || 1 }))}
                      placeholder="Number of people in household"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-pets">Pets (comma separated)</Label>
                    <Input
                      id="edit-pets"
                      value={householdForm.pets}
                      onChange={(e) => setHouseholdForm(prev => ({ ...prev, pets: e.target.value }))}
                      placeholder="e.g., Dog, Cat, Bird"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-medical-needs">Medical Needs (comma separated)</Label>
                    <Input
                      id="edit-medical-needs"
                      value={householdForm.medicalNeeds}
                      onChange={(e) => setHouseholdForm(prev => ({ ...prev, medicalNeeds: e.target.value }))}
                      placeholder="e.g., Diabetes medication, Wheelchair access"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateHousehold} className="flex-1">
                      Update Household
                    </Button>
                    <Button variant="outline" onClick={resetHouseholdForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relation} • {contact.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Emergency Contact</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Contact name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-relation">Relationship</Label>
                          <Input
                            id="edit-relation"
                            value={contactForm.relation}
                            onChange={(e) => setContactForm(prev => ({ ...prev, relation: e.target.value }))}
                            placeholder="e.g., Spouse, Parent, Friend"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone Number</Label>
                          <Input
                            id="edit-phone"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateContact} className="flex-1">
                            Update Contact
                          </Button>
                          <Button variant="outline" onClick={resetContactForm} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus size={14} className="mr-1" />
                  Add Emergency Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="add-name">Name</Label>
                    <Input
                      id="add-name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-relation">Relationship</Label>
                    <Input
                      id="add-relation"
                      value={contactForm.relation}
                      onChange={(e) => setContactForm(prev => ({ ...prev, relation: e.target.value }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-phone">Phone Number</Label>
                    <Input
                      id="add-phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContact} className="flex-1">
                      Add Contact
                    </Button>
                    <Button variant="outline" onClick={resetContactForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            size="lg"
            onClick={() => navigate('/privacy-policy')}
          >
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
