import api from './api';
import { LoginResponse } from '../types/user.types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  return data.data;
}

export async function logoutLocally(): Promise<void> {
  // No server-side session to invalidate yet (Step 3's known limitation) —
  // this exists as a named function so a future blacklist-based logout
  // can slot in here without changing any calling component.
  return Promise.resolve();
}