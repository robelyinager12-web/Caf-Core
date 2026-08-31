import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Loader } from '../components/common/Loader';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

const NewOrderPage = lazy(() =>
  import('../pages/orders/NewOrderPage').then((m) => ({ default: m.NewOrderPage }))
);
const ItemsManagementPage = lazy(() =>
  import('../pages/menu/ItemsManagementPage').then((m) => ({ default: m.ItemsManagementPage }))
);
const CategoryManagementPage = lazy(() =>
  import('../pages/menu/CategoryManagementPage').then((m) => ({ default: m.CategoryManagementPage }))
);
const KitchenDisplayPage = lazy(() =>
  import('../pages/kitchen/KitchenDisplayPage').then((m) => ({ default: m.KitchenDisplayPage }))
);
const ReportsPage = lazy(() =>
  import('../pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const StaffManagementPage = lazy(() =>
  import('../pages/staff/StaffManagementPage').then((m) => ({ default: m.StaffManagementPage }))
);
const BillingPage = lazy(() =>
  import('../pages/billing/BillingPage').then((m) => ({ default: m.BillingPage }))
);
const OrderHistoryPage = lazy(() =>
  import('../pages/orders/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage }))
);
const InventoryPage = lazy(() =>
  import('../pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const AuditLogPage = lazy(() =>
  import('../pages/audit/AuditLogPage').then((m) => ({ default: m.AuditLogPage }))
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader label="Loading page..." />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route
              path="/items"
              element={
                <LazyPage>
                  <ItemsManagementPage />
                </LazyPage>
              }
            />
            <Route
              path="/items/categories"
              element={
                <LazyPage>
                  <CategoryManagementPage />
                </LazyPage>
              }
            />
            <Route
              path="/settings"
              element={
                <LazyPage>
                  <SettingsPage />
                </LazyPage>
              }
            />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} />}>
              <Route
                path="/menu"
                element={
                  <LazyPage>
                    <NewOrderPage />
                  </LazyPage>
                }
              />
              <Route
                path="/billing"
                element={
                  <LazyPage>
                    <BillingPage />
                  </LazyPage>
                }
              />
              <Route
                path="/orders/history"
                element={
                  <LazyPage>
                    <OrderHistoryPage />
                  </LazyPage>
                }
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'KITCHEN']} />}>
              <Route
                path="/kitchen"
                element={
                  <LazyPage>
                    <KitchenDisplayPage />
                  </LazyPage>
                }
              />
              <Route
                path="/inventory"
                element={
                  <LazyPage>
                    <InventoryPage />
                  </LazyPage>
                }
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route
                path="/staff"
                element={
                  <LazyPage>
                    <StaffManagementPage />
                  </LazyPage>
                }
              />
              <Route
                path="/reports"
                element={
                  <LazyPage>
                    <ReportsPage />
                  </LazyPage>
                }
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route
                path="/audit-log"
                element={
                  <LazyPage>
                    <AuditLogPage />
                  </LazyPage>
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}