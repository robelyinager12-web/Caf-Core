import { useState, FormEvent } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useLogin } from '../../hooks/useAuth';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  const errorMessage =
    loginMutation.error instanceof AxiosError
      ? loginMutation.error.response?.data?.message ?? 'Login failed'
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Cafeteria Login</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage the counter or kitchen</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          )}

          <Button type="submit" isLoading={loginMutation.isPending} className="mt-2 w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}