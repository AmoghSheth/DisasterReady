import { createContext, useContext, useEffect, useState } from 'react';
import * as localAuth from '@/lib/localAuth';
import type { LocalUser, UserProfile } from '@/lib/localAuth';

type AuthContextType = {
  user: LocalUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => ({ success: false, error: "Function not implemented." }),
  register: async () => ({ success: false, error: "Function not implemented." }),
  logout: () => {},
  updateUserProfile: async () => ({ success: false, error: "Function not implemented." }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email: string, password: string) => {
    const result = localAuth.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      const userProfile = localAuth.getUserProfile(result.user.email);
      setProfile(userProfile);
    }
    return result;
  };

  // Register function
  const register = async (email: string, password: string, fullName: string) => {
    const result = localAuth.register(email, password, fullName);
    if (result.success && result.user) {
      setUser(result.user);
      const userProfile = localAuth.getUserProfile(result.user.email);
      setProfile(userProfile);
    }
    return result;
  };

  // Logout function
  const logout = () => {
    localAuth.logout();
    setUser(null);
    setProfile(null);
  };

  // Function to update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: "No user logged in." };
    }

    const result = localAuth.updateUserProfile(user.email, updates);
    if (result.success && result.profile) {
      setProfile(result.profile);
    }
    return result;
  };

  // Check for existing session on mount
  useEffect(() => {
    setLoading(true);
    const currentUser = localAuth.getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
      const userProfile = localAuth.getUserProfile(currentUser.email);
      setProfile(userProfile);
    }
    
    setLoading(false);
  }, []);

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
