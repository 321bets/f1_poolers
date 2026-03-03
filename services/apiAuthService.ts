import { User } from '../types';

const API_BASE = '/api';

export const login = async (username: string, password_raw: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: password_raw })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Invalid username or password');
  }
  const user = await res.json();
  // Fix notification dates
  if (user.notifications) {
    user.notifications = user.notifications.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }));
  }
  return user;
};

export const signup = async (username: string, password_raw: string, country: string, location?: {lat: number, lng: number}, timezone?: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: password_raw, country, location, timezone })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Signup failed' }));
    throw new Error(err.error || 'Signup failed');
  }
  const user = await res.json();
  if (user.notifications) {
    user.notifications = user.notifications.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }));
  }
  return user;
};
