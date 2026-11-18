import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// sessionStorage tách phiên đăng nhập giữa các tab cùng localhost:5173.
// KHÔNG tự chuyển token từ localStorage: token cũ được chia sẻ giữa các tab.
const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';
function readSession(): {user: User | null; token: string | null} {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const raw = sessionStorage.getItem(USER_KEY);
    if (!token || !raw) return { user: null, token: null };
    const user = JSON.parse(raw) as User;
    if (!user || !user.id || !user.role) return { user: null, token: null };
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}
function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initial] = useState(readSession);
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  const login = (userData: User, newToken: string) => {
    // Ghi ngay để interceptor dùng đúng JWT với request tiếp theo.
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = {...prev, ...data};
      sessionStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  // 401 từ một API có JWT: đóng phiên ở đúng tab đang gọi API.
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setUser(null);
      setToken(null);
    };
    window.addEventListener('bookstore:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bookstore:unauthorized', handleUnauthorized);
  }, []);

  return <AuthContext.Provider value={{
    user, token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role?.toLowerCase() === 'admin',
    login, logout, updateUser
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  return ctx;
};
export default AuthProvider;
