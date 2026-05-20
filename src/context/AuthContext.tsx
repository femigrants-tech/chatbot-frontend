import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearSession,
  createSession,
  isAdminConfigured,
  validateCredentials,
  validateSession,
} from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  isAdminConfigured: boolean;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    validateSession().then((id) => {
      if (cancelled) return;
      setIsAuthenticated(Boolean(id));
      setUserId(id);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (inputUserId: string, password: string) => {
    if (!validateCredentials(inputUserId, password)) {
      return false;
    }

    const trimmedId = inputUserId.trim();
    await createSession(trimmedId);
    setIsAuthenticated(true);
    setUserId(trimmedId);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        isAdminConfigured: isAdminConfigured(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
