import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { MenuManagementPage } from '../pages/menu/MenuManagementPage';
import { NewOrderPage } from '../pages/orders/NewOrderPage';
import { OrderHistoryPage } from '../pages/orders/OrderHistoryPage';
import { KitchenDisplayPage } from '../pages/kitchen/KitchenDisplayPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { StaffManagementPage } from '../pages/staff/StaffManagementPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuManagementPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />}>
              <Route path="/orders/new" element={<NewOrderPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'KITCHEN']} />}>
              <Route path="/kitchen" element={<KitchenDisplayPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/orders/history" element={<OrderHistoryPage />} />
              <Route path="/staff" element={<StaffManagementPage />} />
            </Route>
            {/* Reports page is added in the next frontend step */}
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}