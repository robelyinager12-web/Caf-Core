import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, PackageX, ShoppingBag, Info, Check } from 'lucide-react';
import clsx from 'clsx';
import { useNotifications } from '../../hooks/useNotifications';
import { markNotificationRead } from '../../services/notificationService';
import { AppNotification, NotificationType } from '../../types/notification.types';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  LOW_STOCK: PackageX,
  NEW_ORDER: ShoppingBag,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  LOW_STOCK: 'text-warning bg-warning/10',
  NEW_ORDER: 'text-primary-600 bg-primary-50',
  SYSTEM: 'text-gray-500 bg-gray-100',
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

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications, unreadCount, isLoading } = useNotifications();

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNotificationClick(notification: AppNotification) {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  }

  function handleMarkAllRead() {
    const unreadIds = (notifications ?? []).filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAllReadMutation.mutate(unreadIds);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Loading...</p>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type];
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={clsx(
                      'flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-gray-50',
                      !notification.isRead && 'bg-primary-50/40'
                    )}
                  >
                    <span className={clsx('mt-0.5 rounded-full p-1.5', TYPE_COLOR[notification.type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1">
                      <p className={clsx('text-sm', !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600')}>
                        {notification.message}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{timeAgo(notification.createdAt)}</p>
                    </span>
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}