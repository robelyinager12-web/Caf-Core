import { api } from './api';
import { StaffShift } from '../types/staff.types';

interface ShiftsQuery {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  activeOnly?: boolean;
}

export async function clockIn(userId?: string): Promise<StaffShift> {
  const { data } = await api.post('/staff/clock-in', userId ? { userId } : {});
  return data.data;
}

export async function clockOut(userId?: string): Promise<StaffShift> {
  const { data } = await api.post('/staff/clock-out', userId ? { userId } : {});
  return data.data;
}

export async function getActiveStaff(): Promise<StaffShift[]> {
  const { data } = await api.get('/staff/active');
  return data.data;
}

export async function getShifts(query: ShiftsQuery = {}): Promise<StaffShift[]> {
  const { data } = await api.get('/staff/shifts', { params: query });
  return data.data;
}