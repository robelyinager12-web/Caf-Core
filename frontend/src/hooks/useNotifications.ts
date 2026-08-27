import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getNotifications } from '../services/notificationService';
import { useSocket } from './useSocket';
import { useToastStore } from '../components/common/Toast';
import { AppNotification } from '../types/notification.types';

/**
 * Fetches recent notifications and keeps them live-updated via the
 * 'notification:new' Socket.IO event (emitted by the backend's
 * notification.service.ts on every createNotification call — low stock
 * alerts, new orders). New events are prepended directly into the React
 * Query cache rather than triggering a refetch, so the bell updates
 * instantly without an extra round trip.
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const handleNewNotification = useCallback(
    (notification: AppNotification) => {
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev ? [notification, ...prev] : [notification]
      );
      showToast(notification.message);
    },
    [queryClient, showToast]
  );

  useSocket({ 'notification:new': handleNewNotification });

  const unreadCount = (query.data ?? []).filter((n) => !n.isRead).length;

  return { ...query, unreadCount };
}