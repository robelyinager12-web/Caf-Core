import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { MenuManagementPage } from '../pages/menu/MenuManagementPage';
import { NewOrderPage } from '../pages/orders/NewOrderPage';
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
            <Route
              element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />}
            >
              <Route path="/orders/new" element={<NewOrderPage />} />
            </Route>
            {/* Order History, Kitchen, Inventory, Staff, Reports pages
                are added in the following frontend steps */}
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}