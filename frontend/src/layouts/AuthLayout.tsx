import { Outlet } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-800 dark:bg-gray-900 dark:ring-gray-800">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <ChefHat className="h-5 w-5" />
          </span>
          <h1 className="text-base font-bold text-primary-600">CaféCore</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Cafeteria Management System
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}