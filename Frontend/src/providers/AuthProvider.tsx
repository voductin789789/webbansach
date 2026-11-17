// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types';
import { api } from '../api/httpClient';
import { tokenStorage } from '../api/tokenStorage';
import { ApiEnvelope, getResponseData } from '../api/response';
import { ApiUser, mapApiUser } from '../api/auth';
import { toast } from '../components/ui/Toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return tokenStorage.getUser();
  });
  const [token, setToken] = useState<string | null>(() => {
    return tokenStorage.getToken();
  });
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    let active = true;
    api.get<ApiEnvelope<ApiUser>>('/auth/me')
      .then((response) => {
        if (active) setUser(mapApiUser(getResponseData(response)));
      })
      .catch((reason: unknown) => {
        if (!tokenStorage.getToken()) setUser(null);
        else if (active && axios.isAxiosError(reason) && !reason.response) {
          toast.error('Không thể xác minh phiên đăng nhập. Vui lòng kiểm tra kết nối.');
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback((userData: User, newToken: string) => {
    tokenStorage.setToken(newToken);
    tokenStorage.setUser(userData);
    setUser(userData);
    setToken(newToken);
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setToken(null);
    setReady(true);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((previous) => {
      if (!previous) return null;
      const updated = { ...previous, ...data };
      tokenStorage.setUser(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      tokenStorage.clear();
      setUser(null);
      setToken(null);
      setReady(true);
    };
    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return ctx;
};

export default AuthProvider;
