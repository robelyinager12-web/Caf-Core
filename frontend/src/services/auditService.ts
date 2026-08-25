import { api } from './api';
import { AuditLog } from '../types/audit.types';

interface AuditLogsQuery {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function getAuditLogs(query: AuditLogsQuery = {}): Promise<AuditLog[]> {
  const { data } = await api.get('/audit', { params: query });
  return data.data;
}

export async function getAuditActions(): Promise<string[]> {
  const { data } = await api.get('/audit/actions');
  return data.data;
}