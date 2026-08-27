import { api } from './api';
import { AppNotification } from '../types/notification.types';

export async function getNotifications(unreadOnly = false): Promise<AppNotification[]> {
  const { data } = await api.get('/notifications', { params: { unreadOnly } });
  return data.data;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}