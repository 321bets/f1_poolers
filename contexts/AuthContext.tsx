import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';
import * as authService from '../services/apiAuthService';
import { isBiometricAvailable, registerBiometric, authenticateBiometric, hasStoredCredentials } from '../services/biometricService';

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
  signup: (username: string, password: string, country: string, location?: {lat: number, lng: number}, timezone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  biometricAvailable: boolean;
  biometricRegistered: boolean;
  loginWithBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(hasStoredCredentials());
  const initialized = useRef(false);

  // Restore session from localStorage on mount, validating against the API
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const storedUser = getStoredUser();
    if (storedUser) {
      // Validate the stored user exists in the database
      fetch(`/api/users/${storedUser.id}`)
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          // User not found in DB — clear stale session
          console.warn('Stored user not found in database, clearing session');
          persistUser(null);
          setUser(null);
          return null;
        })
        .then(freshUser => {
          if (freshUser) {
            // Fix notification dates
            if (freshUser.notifications) {
              freshUser.notifications = freshUser.notifications.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp)
              }));
            }
            setUser(freshUser);
            persistUser(freshUser);
          }
          setIsLoading(false);
        })
        .catch(() => {
          // Network error — use stored user as fallback
          setUser(storedUser);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const login = async (username: string, password: string) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    persistUser(loggedInUser);
  };

  const signup = async (username: string, password: string, country: string, location?: {lat: number, lng: number}, timezone?: string) => {
    const newUser = await authService.signup(username, password, country, location, timezone);
    setUser(newUser);
    persistUser(newUser);

    // Offer biometric registration after signup
    if (biometricAvailable) {
      try {
        const registered = await registerBiometric(newUser.id, username);
        if (registered) {
          setBiometricRegistered(true);
        }
      } catch {}
    }
  };

  const loginWithBiometric = async () => {
    const username = await authenticateBiometric();
    if (!username) throw new Error('Biometric authentication failed');
    // Look up user from stored session or use a known password-less flow
    const storedUser = getStoredUser();
    if (storedUser && storedUser.username === username) {
      setUser(storedUser);
      return;
    }
    throw new Error('Biometric authentication failed. Please log in with your password.');
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
    biometricAvailable,
    biometricRegistered,
    loginWithBiometric,
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
