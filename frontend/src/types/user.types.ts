export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}