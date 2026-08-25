import { api } from './api';
import { AuthResponse, Role } from '../types/user.types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

export async function registerStaff(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}