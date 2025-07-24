import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

// Define the structure of our user profile data
export interface UserProfile {
  username: string;
  full_name?: string;
  zip_code?: string;
  household_size?: number;
  pets?: string[];
  medical_needs?: string[];
  location?: { lat: number; lng: number };
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  updateUserProfile: async () => ({ success: false, error: "Function not implemented." }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to update user profile in Supabase
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: "No user logged in." };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('username', user.email)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data); // Update local state with new profile data
      return { success: true };
    } catch (error: any) {
      console.error("Error updating user profile:", error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    setLoading(true);

    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setLoading(false);
        return;
      }
      setSession(session);
      
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('username', currentUser.email)
          .single();
        
        if (profileError) {
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    setData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          setLoading(true);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', currentUser.email)
            .single();
          
          if (error) {
            setProfile(null);
          } else {
            setProfile(data);
          }
          setLoading(false);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
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
