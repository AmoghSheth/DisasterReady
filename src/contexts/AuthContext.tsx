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
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] useEffect started');
    setLoading(true);

    const setData = async () => {
      console.log('[AuthContext] setData: Fetching session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthContext] setData: Error getting session:', error);
        setLoading(false);
        return;
      }
      console.log('[AuthContext] setData: Session fetched', session);
      setSession(session);
      
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      console.log('[AuthContext] setData: User set', currentUser);

      if (currentUser) {
        console.log(`[AuthContext] setData: User found, fetching profile for ${currentUser.email}...`);
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('username', currentUser.email)
          .single();
        
        if (profileError) {
          console.error('[AuthContext] setData: Error fetching profile:', profileError);
          setProfile(null);
        } else {
          console.log('[AuthContext] setData: Profile fetched', data);
          setProfile(data);
        }
      } else {
        console.log('[AuthContext] setData: No user, setting profile to null');
        setProfile(null);
      }
      
      console.log('[AuthContext] setData: Finished, setting loading to false');
      setLoading(false);
    };

    setData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthContext] onAuthStateChange: Event received - ${event}`, session);
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        console.log('[AuthContext] onAuthStateChange: User set', currentUser);

        if (currentUser) {
          console.log(`[AuthContext] onAuthStateChange: User found, fetching profile for ${currentUser.email}...`);
          setLoading(true);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', currentUser.email)
            .single();
          
          if (error) {
            console.error("[AuthContext] onAuthStateChange: Error fetching profile:", error);
            setProfile(null);
          } else {
            console.log('[AuthContext] onAuthStateChange: Profile fetched', data);
            setProfile(data);
          }
          console.log('[AuthContext] onAuthStateChange: Finished, setting loading to false');
          setLoading(false);
        } else {
          console.log('[AuthContext] onAuthStateChange: No user, setting profile to null');
          setProfile(null);
        }
      }
    );

    return () => {
      console.log('[AuthContext] useEffect cleanup: Unsubscribing from auth changes.');
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
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
