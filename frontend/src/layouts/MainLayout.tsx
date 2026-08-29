import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  ChefHat,
  Package,
  Users,
  BarChart3,
  ShieldAlert,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useLogout } from '../hooks/useAuth';
import { Role } from '../types/user.types';
import { ShiftClockWidget } from '../components/staff/ShiftClockWidget';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { ThemeToggle } from '../components/common/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/orders/new', label: 'New Order', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/orders/history', label: 'Order History', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER'] },
  { to: '/kitchen', label: 'Kitchen Orders', icon: ChefHat, roles: ['ADMIN', 'MANAGER', 'KITCHEN'] },
  { to: '/inventory', label: 'Inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'KITCHEN'] },
  { to: '/staff', label: 'Users Accounts', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { to: '/audit-log', label: 'Audit Log', icon: ShieldAlert, roles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function initials(fullName?: string): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const handleLogout = useLogout();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col bg-white shadow-sm ring-1 ring-gray-200 transition-transform dark:bg-gray-900 dark:ring-gray-800 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-500">
            {initials(user?.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={closeSidebar} />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <button onClick={toggleSidebar} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
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