import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

function initials(fullName?: string): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const handleLogout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goTo(path: string) {
    setIsOpen(false);
    navigate(path);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-lg p-1 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-500">
          {initials(user?.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</p>
          <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">{user?.role}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 px-3 pb-2 dark:border-gray-800">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-500">
              {initials(user?.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col pt-1">
            <button
              onClick={() => goTo('/settings')}
              className="flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <User className="h-4 w-4 text-gray-400" />
              Account
            </button>
            <button
              onClick={() => goTo('/billing')}
              className="flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <CreditCard className="h-4 w-4 text-gray-400" />
              Billing
            </button>
            <button
              onClick={() => goTo('/settings')}
              className="flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Bell className="h-4 w-4 text-gray-400" />
              Notifications
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}