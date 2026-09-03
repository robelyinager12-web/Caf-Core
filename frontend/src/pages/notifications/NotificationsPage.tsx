import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, PackageX, ShoppingBag, Info, Check } from 'lucide-react';
import clsx from 'clsx';
import { useNotifications } from '../../hooks/useNotifications';
import { markNotificationRead } from '../../services/notificationService';
import { Loader } from '../../components/common/Loader';
import { AppNotification, NotificationType } from '../../types/notification.types';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  LOW_STOCK: PackageX,
  NEW_ORDER: ShoppingBag,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  LOW_STOCK: 'text-warning bg-warning/10',
  NEW_ORDER: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10',
  SYSTEM: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPage() {
  const { data: notifications, unreadCount, isLoading } = useNotifications();
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev ? prev.map((n) => (n.id === updated.id ? updated : n)) : prev
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async (unreadIds: string[]) => {
      await Promise.all(unreadIds.map((id) => markNotificationRead(id)));
    },
    onSuccess: () => {
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev) =>
        prev ? prev.map((n) => ({ ...n, isRead: true })) : prev
      );
    },
  });

  function handleMarkAllRead() {
    const unreadIds = (notifications ?? []).filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAllReadMutation.mutate(unreadIds);
    }
  }

  if (isLoading) {
    return <Loader label="Loading notifications..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        {notifications && notifications.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {notifications.map((notification) => {
              const Icon = TYPE_ICON[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => !notification.isRead && markReadMutation.mutate(notification.id)}
                  className={clsx(
                    'flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800',
                    !notification.isRead && 'bg-primary-50/40 dark:bg-primary-500/5'
                  )}
                >
                  <span className={clsx('mt-0.5 rounded-full p-2', TYPE_COLOR[notification.type])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <p
                      className={clsx(
                        'text-sm',
                        !notification.isRead
                          ? 'font-medium text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {notification.message}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </span>
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
            No notifications yet.
          </p>
        )}
      </div>
    </div>
  );
}