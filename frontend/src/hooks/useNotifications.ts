import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getNotifications } from '../services/notificationService';
import { useSocket } from './useSocket';
import { useToastStore } from '../components/common/Toast';
import { usePreferencesStore } from '../store/preferencesStore';
import { AppNotification } from '../types/notification.types';

/**
 * Fetches recent notifications and keeps them live-updated via the
 * 'notification:new' Socket.IO event. New events are prepended directly
 * into the React Query cache rather than triggering a refetch, so the bell
 * updates instantly without an extra round trip. Whether a toast pop-up
 * also fires is gated by the user's stored preference (Settings page).
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const toastNotificationsEnabled = usePreferencesStore((state) => state.toastNotificationsEnabled);

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const handleNewNotification = useCallback(
    (notification: AppNotification) => {
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev ? [notification, ...prev] : [notification]
      );
      if (toastNotificationsEnabled) {
        showToast(notification.message);
      }
    },
    [queryClient, showToast, toastNotificationsEnabled]
  );

  useSocket({ 'notification:new': handleNewNotification });

  const unreadCount = (query.data ?? []).filter((n) => !n.isRead).length;

  return { ...query, unreadCount };
}