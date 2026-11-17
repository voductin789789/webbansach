import { User } from '../types';

const TOKEN_KEY = 'bookstore_token';
const USER_KEY = 'bookstore_user';
const LEGACY_TOKEN_KEY = 'access_token';
const LEGACY_USER_KEY = 'auth_user';

export const tokenStorage = {
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return token;
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  },

  getUser(): User | null {
    const stored = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    if (!stored) return null;

    try {
      const user = JSON.parse(stored) as User;
      if (!user || typeof user.id !== 'string' || typeof user.email !== 'string') return null;
      return user;
    } catch {
      return null;
    } finally {
      localStorage.removeItem(LEGACY_USER_KEY);
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(LEGACY_USER_KEY);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  },
};
