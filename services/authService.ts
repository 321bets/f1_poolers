import { User } from '../types';

const API_URL = '/api';

export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Invalid username or password' }));
      throw new Error(errorData.error || 'Invalid username or password');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const signup = async (username: string, password: string, country: string, location?: {lat: number, lng: number}): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, country, location })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create account' }));
      throw new Error(error.error || 'Failed to create account');
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};
