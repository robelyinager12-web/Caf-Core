import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ChefHat,
  Users,
  BarChart3,
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

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/items', label: 'Items', icon: Package },
  { to: '/kitchen', label: 'Kitchen Orders', icon: ChefHat, roles: ['ADMIN', 'MANAGER', 'KITCHEN'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { to: '/staff', label: 'Users Accounts', icon: Users, roles: ['ADMIN', 'MANAGER'] },
];

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  // If the window is resized up to desktop width while the mobile sidebar
  // is open, close it — otherwise isSidebarOpen stays true in the store
  // and re-shrinking the window back down would show the sidebar already
  // open with no click needed, which is confusing. The 1024px breakpoint
  // matches Tailwind's `lg` used everywhere else in this layout.
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

        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <UserMenu />
        </div>
      </aside>

      {/* Backdrop — only rendered when the sidebar is actually open, so it
          never intercepts clicks on desktop where the sidebar is always
          visible via lg:translate-x-0 regardless of isSidebarOpen. */}
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
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700"
          >
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