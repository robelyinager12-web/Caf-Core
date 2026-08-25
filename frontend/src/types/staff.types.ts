import { Role } from './user.types';

export interface StaffShift {
  id: string;
  userId: string;
  user: { id: string; fullName: string; role: Role };
  shiftStart: string;
  shiftEnd: string | null;
  createdAt: string;
}