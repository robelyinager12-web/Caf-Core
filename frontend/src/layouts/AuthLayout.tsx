import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-600">CaféCore</h1>
          <p className="text-sm text-gray-500">Cafeteria Management System</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
}