import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { signup } from '../../services/authService';
import { getErrorMessage } from '../../utils/validators';
import { useToastStore } from '../../components/common/Toast';

function getPasswordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('an uppercase letter');
  if (!/[0-9]/.test(password)) issues.push('a number');
  return issues;
}

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.show);

  const passwordIssues = password ? getPasswordIssues(password) : [];

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      showToast('Account created — you can now sign in');
      navigate('/login');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (passwordIssues.length > 0) return;
    signupMutation.mutate({ fullName, email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
        Create an Account
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Business Name
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Business Name"
          required
          autoFocus
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
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
            placeholder="Password"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Must be at least 8 characters, with an uppercase letter and a number.
        </p>
        {passwordIssues.length > 0 && (
          <p className="text-xs text-danger">Still needs: {passwordIssues.join(', ')}</p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={signupMutation.isPending}
        disabled={passwordIssues.length > 0}
        className="w-full"
      >
        Register
      </Button>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Already have account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Login Here
        </button>
      </p>
    </form>
  );
}