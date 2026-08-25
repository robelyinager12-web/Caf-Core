export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}