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

interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

export async function registerStaff(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post('/auth/signup', payload);
  return data.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.post('/auth/change-password', payload);
}