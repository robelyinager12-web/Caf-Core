import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Loader } from '../components/common/Loader';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

const MenuManagementPage = lazy(() =>
  import('../pages/menu/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage }))
);
const NewOrderPage = lazy(() =>
  import('../pages/orders/NewOrderPage').then((m) => ({ default: m.NewOrderPage }))
);
const OrderHistoryPage = lazy(() =>
  import('../pages/orders/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage }))
);
const KitchenDisplayPage = lazy(() =>
  import('../pages/kitchen/KitchenDisplayPage').then((m) => ({ default: m.KitchenDisplayPage }))
);
const InventoryPage = lazy(() =>
  import('../pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const StaffManagementPage = lazy(() =>
  import('../pages/staff/StaffManagementPage').then((m) => ({ default: m.StaffManagementPage }))
);
const ReportsPage = lazy(() =>
  import('../pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))
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
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/menu"
              element={
                <LazyPage>
                  <MenuManagementPage />
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
                path="/orders/new"
                element={
                  <LazyPage>
                    <NewOrderPage />
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
                path="/orders/history"
                element={
                  <LazyPage>
                    <OrderHistoryPage />
                  </LazyPage>
                }
              />
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