export type NotificationType = 'LOW_STOCK' | 'NEW_ORDER' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  targetRole: string | null;
  createdAt: string;
}