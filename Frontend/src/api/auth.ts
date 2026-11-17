import { User } from '../types';
import { api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

export interface ApiUser {
  id: number | string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'customer' | 'admin';
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  loyaltyPoints?: number;
}

export interface AuthResult {
  user: ApiUser;
  token: string;
}

export const mapApiUser = (user: ApiUser): User => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role.toLowerCase() === 'admin' ? 'admin' : 'customer',
  phone: user.phone || undefined,
  address: user.address || undefined,
  avatar: user.avatar || undefined,
  loyaltyPoints: user.loyaltyPoints ?? 0,
});

export const loginWithPassword = async (email: string, password: string): Promise<AuthResult> => {
  const response = await api.post<ApiEnvelope<AuthResult>>('/auth/login', { email, password });
  return getResponseData(response);
};

export const registerAccount = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}): Promise<AuthResult> => {
  const response = await api.post<ApiEnvelope<AuthResult>>('/auth/register', data);
  return getResponseData(response);
};
