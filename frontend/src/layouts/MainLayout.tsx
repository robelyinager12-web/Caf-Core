import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  CreditCard,
  ChefHat,
  Users,
  BarChart3,
  ShieldAlert,
  Settings as SettingsIcon,
  ChevronDown,
  Menu as MenuIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Role } from '../types/user.types';
import { ShiftClockWidget } from '../components/staff/ShiftClockWidget';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { UserMenu } from '../components/common/UserMenu';

interface NavChild {
  to: string;
  label: string;
}

interface NavEntry {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
  to?: string;
  children?: NavChild[];
}

const NAV_CONFIG: NavEntry[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  {
    key: 'menu',
    label: 'Menu',
    icon: UtensilsCrossed,
    roles: ['ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'],
    children: [
      { to: '/menu/categories', label: 'Categories' },
      { to: '/menu/items', label: 'Menu Items' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Package,
    roles: ['ADMIN', 'MANAGER', 'KITCHEN'],
    to: '/inventory',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    children: [
      { to: '/orders/new', label: 'New Order' },
      { to: '/orders/history', label: 'Order History' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: CreditCard,
    roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    to: '/billing',
  },
  {
    key: 'kitchen',
    label: 'Kitchen Orders',
    icon: ChefHat,
    roles: ['ADMIN', 'MANAGER', 'KITCHEN'],
    to: '/kitchen',
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: Users,
    roles: ['MANAGER'],
    to: '/staff',
  },
  {
    key: 'user-accounts',
    label: 'User Accounts',
    icon: Users,
    roles: ['ADMIN'],
    to: '/staff',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER'],
    to: '/reports',
  },
  {
    key: 'audit-log',
    label: 'Audit Log',
    icon: ShieldAlert,
    roles: ['ADMIN'],
    to: '/audit-log',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    roles: ['ADMIN'],
    to: '/settings',
  },
];

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const visibleEntries = NAV_CONFIG.filter(
    (entry) => !entry.roles || (user && entry.roles.includes(user.role))
  );

  useEffect(() => {
    const activeGroup = visibleEntries.find((entry) =>
      entry.children?.some((child) => location.pathname.startsWith(child.to))
    );
    if (activeGroup) {
      setOpenGroups((prev) => new Set(prev).add(activeGroup.key));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        closeSidebar();
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col bg-white shadow-sm ring-1 ring-gray-200 transition-transform duration-200 ease-in-out dark:bg-gray-900 dark:ring-gray-800',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
            <ChefHat className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">CaféCore</h1>
            <p className="text-[11px] leading-tight text-gray-400 dark:text-gray-500">Cafeteria System</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visibleEntries.map((entry) => {
            if (entry.children) {
              const isOpen = openGroups.has(entry.key);
              const isChildActive = entry.children.some((child) =>
                location.pathname.startsWith(child.to)
              );

              return (
                <div key={entry.key}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(entry.key)}
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                      isChildActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-500'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    <entry.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{entry.label}</span>
                    <ChevronDown
                      className={clsx('h-3.5 w-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-gray-100 pl-4 dark:border-gray-800">
                      {entry.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            clsx(
                              'rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive
                                ? 'bg-primary-600 font-medium text-white'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={entry.key}
                to={entry.to!}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )
                }
              >
                <entry.icon className="h-4 w-4" />
                {entry.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <UserMenu />
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isSidebarOpen}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            <NotificationBell />
            <ShiftClockWidget />
          </div>
        </header>

        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}