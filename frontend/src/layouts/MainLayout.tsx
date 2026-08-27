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
  { to: '/kitchen', label: 'Kitchen Display', icon: ChefHat, roles: ['ADMIN', 'MANAGER', 'KITCHEN'] },
  { to: '/inventory', label: 'Inventory', icon: Package, roles: ['ADMIN', 'MANAGER', 'KITCHEN'] },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { to: '/audit-log', label: 'Audit Log', icon: ShieldAlert, roles: ['ADMIN'] },
];

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const handleLogout = useLogout();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-sm ring-1 ring-gray-200 transition-transform lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <h1 className="text-lg font-bold text-primary-600">CaféCore</h1>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={closeSidebar} />
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          <button onClick={toggleSidebar} className="lg:hidden">
            <MenuIcon className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationBell />
            <ShiftClockWidget />

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}