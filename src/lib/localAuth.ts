// Local Authentication System using localStorage

export interface LocalUser {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  full_name: string;
  createdAt: string;
}

export interface UserProfile {
  username: string;
  full_name?: string;
  zip_code?: string;
  household_size?: number;
  pets?: string[];
  medical_needs?: string[];
  location?: { lat: number; lng: number };
}

const USERS_KEY = 'disasterready_users';
const CURRENT_USER_KEY = 'disasterready_current_user';
const PROFILES_KEY = 'disasterready_profiles';

// Helper function to get all users
const getUsers = (): LocalUser[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper function to save users
const saveUsers = (users: LocalUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Helper function to get profiles
const getProfiles = (): Record<string, UserProfile> => {
  const profilesJson = localStorage.getItem(PROFILES_KEY);
  return profilesJson ? JSON.parse(profilesJson) : {};
};

// Helper function to save profiles
const saveProfiles = (profiles: Record<string, UserProfile>): void => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

// Register a new user
export const register = (email: string, password: string, fullName: string): { success: boolean; error?: string; user?: LocalUser } => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'User with this email already exists' };
  }

  // Create new user
  const newUser: LocalUser = {
    id: crypto.randomUUID(),
    email,
    password, // In production, hash this!
    full_name: fullName,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Create initial profile
  const profiles = getProfiles();
  profiles[email] = {
    username: email,
    full_name: fullName,
  };
  saveProfiles(profiles);

  return { success: true, user: newUser };
};

// Login user
export const login = (email: string, password: string): { success: boolean; error?: string; user?: LocalUser } => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Set current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return { success: true, user };
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Get current user
export const getCurrentUser = (): LocalUser | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Get user profile
export const getUserProfile = (email: string): UserProfile | null => {
  const profiles = getProfiles();
  return profiles[email] || null;
};

// Update user profile
export const updateUserProfile = (email: string, updates: Partial<UserProfile>): { success: boolean; error?: string; profile?: UserProfile } => {
  const profiles = getProfiles();
  
  if (!profiles[email]) {
    return { success: false, error: 'Profile not found' };
  }

  profiles[email] = {
    ...profiles[email],
    ...updates,
  };

  saveProfiles(profiles);
  
  return { success: true, profile: profiles[email] };
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
