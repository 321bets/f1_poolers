import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

const AUTH_USER_STORAGE_KEY = 'f1poolers_auth_user';

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      // Validate that it has required fields
      if (parsed && parsed.id && parsed.username) {
        return parsed;
      }
    }
    return null;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

const persistUser = (user: User | null) => {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {}
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, age: number, country: string, location?: {lat: number, lng: number}) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    persistUser(loggedInUser);
  };

  const signup = async (username: string, password: string, age: number, country: string, location?: {lat: number, lng: number}) => {
    const newUser = await authService.signup(username, password, age, country, location);
    setUser(newUser);
    persistUser(newUser);
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    persistUser(updatedUser);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
