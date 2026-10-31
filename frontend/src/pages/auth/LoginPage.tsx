import { useState, FormEvent } from 'react';
import { Eye, EyeOff, LogIn, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useLogin } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/validators';
import { useToastStore } from '../../components/common/Toast';
import { Role } from '../../types/user.types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'KITCHEN', label: 'Kitchen Staff' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const showToast = useToastStore((state) => state.show);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!role) return;
    loginMutation.mutate({ email, password, role });
  }

  // No unverified password reset exists yet — see Settings > Change
  // Password for logged-in users, or an Admin can edit an account directly.
  function handleForgotPassword() {
    showToast('Contact your administrator to reset your password', 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@cafeteria.local"
          required
          autoFocus
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sign in as
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role | '')}
          required
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="" disabled>
            Select your assigned role
          </option>
          {ROLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          <Lock className="h-3 w-3" />
          Forgot Password
        </button>
      </div>

      {loginMutation.isError && (
        <p className="text-sm text-danger">{getErrorMessage(loginMutation.error)}</p>
      )}

      <Button type="submit" isLoading={loginMutation.isPending} disabled={!role} className="w-full">
        <LogIn className="h-4 w-4" />
        Login
      </Button>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Your account and role must be created by an administrator.
      </p>
    </form>
  );
}