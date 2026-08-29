import { Outlet } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <ChefHat className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-bold text-primary-600">CaféCore</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use your email and password to sign in
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}