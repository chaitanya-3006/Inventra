'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, saveToken, logout as authLogout, getToken } from './auth';

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setUser(getUser());
    }
    setLoading(false);

    const handleStorage = () => {
      const token = getToken();
      if (token) {
        setUser(getUser());
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (token: string, user: AuthUser) => {
    saveToken(token, user);
    setUser(user);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context || context.loading) {
    return { 
      user: null, 
      loading: true, 
      login: () => {}, 
      logout: () => {} 
    };
  }
  
  return context;
}
